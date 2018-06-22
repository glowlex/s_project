export function subjectsToHash(subjects, id){
  let hash = {};
  subjects.forEach(s => hash[s[id]] = s);
  return hash;
}

function getRootElementFontSize( ) {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
}
export function convertRem(value) {
    return value * getRootElementFontSize();
}
