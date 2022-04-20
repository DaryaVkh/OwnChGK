export const encodeCP1251 = function (text: string) {
    function encodeChar(c: string) {
        const isKyr = function (str: string) {
            return /[а-я]/i.test(str);
        }
        const cp1251 = 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬*®Ї°±Ііґµ¶·\
ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя';
        const p = isKyr(c) ? (cp1251.indexOf(c) + 128) : c.charCodeAt(0);
        let h = p.toString(16);
        if (h == 'a') {
            h = '0A';
        }
        return '%' + h;
    }

    let res = '';
    for (let i = 0; i < text.length; i++) {
        res += encodeChar(text.charAt(i))
    }
    return res;
}

export const decodeCP1251 = function (text: string){
    function decodeChar(s: string, p: number) {
        const cp1251 = 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬*®Ї°±Ііґµ¶·\
ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя';
        p = parseInt(p.toString(), 16);
        return p < 128 ? String.fromCharCode(p) : cp1251[p - 128];
    }
    return text.replace(/%(..)/g,decodeChar);
}


export const createFileLink = function (table: string, fileName: string) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=cp1251,' + encodeCP1251(table));
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}