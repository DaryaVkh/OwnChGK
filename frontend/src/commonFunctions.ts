export const getCookie = (name: string) => {
    let matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([$?*|{}\[\]\\\/^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export const getUrlForSocket = () => {
    return `ws://${window.location.host.split(':')[0]}:1025`;
}