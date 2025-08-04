export function normalizeName(str) {
    let norm = (str || "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    if (norm.length > 3 && /[sxz]$/.test(norm)) {
        norm = norm.slice(0, -1);
    }
    return norm;
}
