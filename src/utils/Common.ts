const convertToTimeString = (timeInSeconds: number) => {
    let isoTime = new Date(timeInSeconds * 1000).toISOString();
    let result = isoTime.match(/\d\d:\d\d:\d\d/);
    return result[0];
}

export {
    convertToTimeString
}