export const getAll = async (path: string) => {
    const request = await fetch(path);
    return await request.json();
}