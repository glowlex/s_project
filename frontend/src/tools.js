
function getRootElementFontSize( ) {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
}
export function convertRem(value) {
    return value * getRootElementFontSize();
}
