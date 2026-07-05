import sys
import json
from playwright.sync_api import sync_playwright

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3007
    url = f"http://localhost:{port}"
    
    issues = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda err: console_errors.append(f"[pageerror] {err}"))
        
        try:
            page.goto(url, timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)
        except Exception as e:
            issues.append(f"页面加载失败: {e}")
            print(json.dumps({"issues": issues, "screenshot": None}, ensure_ascii=False, indent=2))
            browser.close()
            return
        
        page.screenshot(path="tests/initial_page.png", full_page=True)
        
        buttons = page.locator("button").all()
        button_texts = [b.inner_text().strip() for b in buttons if b.inner_text().strip()]
        
        headings = page.locator("h1, h2, h3").all()
        heading_texts = [h.inner_text().strip() for h in headings if h.inner_text().strip()]
        
        images = page.locator("img").all()
        
        tab_buttons = page.locator('[role="tab"]').all()
        tab_texts = [t.inner_text().strip() for t in tab_buttons if t.inner_text().strip()]
        
        product_cards = page.locator('[class*="product"], [class*="Product"], [class*="card"]').all()
        
        page_info = {
            "title": page.title(),
            "url": page.url,
            "button_count": len(buttons),
            "button_texts": button_texts[:30],
            "heading_count": len(headings),
            "heading_texts": heading_texts[:20],
            "image_count": len(images),
            "tab_count": len(tab_buttons),
            "tab_texts": tab_texts,
            "card_count": len(product_cards),
            "console_errors": console_errors,
        }
        
        result = {
            "issues": issues,
            "page_info": page_info,
            "screenshot": "tests/initial_page.png"
        }
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
        browser.close()

if __name__ == "__main__":
    main()
