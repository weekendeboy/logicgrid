const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project({ tsConfigFilePath: './tsconfig.json' });
const sourceFile = project.addSourceFileAtPath('src/components/RightSidebar.tsx');

let changed = false;

const elementsToReplace = [];

sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement).forEach(jsxElement => {
    const openingElement = jsxElement.getOpeningElement();
    const tagName = openingElement.getTagNameNode().getText();
    
    if (tagName === 'div') {
        const children = jsxElement.getJsxChildren().filter(c => c.getKind() === SyntaxKind.JsxElement || c.getKind() === SyntaxKind.JsxSelfClosingElement);
        if (children.length >= 2) {
            const firstChild = children[0];
            if (firstChild.getKind() === SyntaxKind.JsxElement) {
                const classNameAttr = firstChild.getOpeningElement().getAttribute('className');
                if (classNameAttr && classNameAttr.getKind() === SyntaxKind.JsxAttribute) {
                    const val = classNameAttr.getInitializer().getText();
                    if ((val.includes('text-xs font-bold') && val.includes('uppercase tracking-wider') && !val.includes('cursor-pointer') && val.includes('mb-1.5')) ||
                        val.includes('text-[11px] font-bold text-slate-400 mb-1')) {
                        elementsToReplace.push({
                            jsxElement,
                            firstChild,
                            val
                        });
                    }
                }
            }
        }
    }
});

// Process in reverse to avoid invalidating positions
elementsToReplace.reverse().forEach(({ jsxElement, firstChild, val }) => {
    try {
        const openingElement = jsxElement.getOpeningElement();
        const titleNode = firstChild.getJsxChildren().map(c => c.getText()).join('');
        const titleClass = val.replace(/^"|"$/g, '');
        
        openingElement.getTagNameNode().replaceWithText('CollapsibleSection');
        jsxElement.getClosingElement().getTagNameNode().replaceWithText('CollapsibleSection');
        
        openingElement.addAttribute({ name: 'titleNode', initializer: `{<>${titleNode}</>}` });
        openingElement.addAttribute({ name: 'titleClass', initializer: `"${titleClass}"` });
        
        firstChild.replaceWithText('');
        changed = true;
    } catch (e) {
        console.error(e);
    }
});

if (changed) {
    sourceFile.saveSync();
    console.log("Transformed with ts-morph successfully");
} else {
    console.log("No elements matched");
}
