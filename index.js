let BOXES = 3000;
for(var i = BOXES; i >= 0; i--) {
    let normalized = i / BOXES;
    let rect = new UIElement(
        new Dimensions(0, i/BOXES),
        new Dimensions(0, 0.5)
    );
    
    rect.anchor = new Vector2(0.5, 1-0.5);
    rect.fill = `rgb(${normalized * 255}, ${normalized * 255}, ${normalized * 255})`;
    
    rect.beforeRender = function() {
        rect.rotation += (deltatime/10) * (normalized**normalized);
    }
    
    coreUI.appendChild(rect);
}