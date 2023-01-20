export const createStyle = (styleString: string): HTMLStyleElement => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styleString;
    return styleElement;
}

export const createHtmlTemplate = (htmlString: string): HTMLTemplateElement => {
    const templateElement = document.createElement('template');
    templateElement.innerHTML = htmlString;
    return templateElement;
}

export const createHtmlTemplateWithStyles = (htmlString: string, styleStrings: string | string[]) => {
    const template = createHtmlTemplate(htmlString);
    const styles = (Array.isArray(styleStrings) ? styleStrings : [styleStrings]).map(createStyle);
    styles.forEach(style => template.content.appendChild(style))
    return template;
}