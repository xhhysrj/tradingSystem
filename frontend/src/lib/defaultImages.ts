
const LOCAL_COVER_MAX = 51;

export function getTextbookImage(
    images: string[] | undefined,
    textbookId?: string
): string {
    if (images && images.length > 0 && images[0]) {
        return images[0];
    }
    return getDefaultImage(textbookId);
}

export function getDefaultImage(textbookId?: string): string {
    if (textbookId) {
        // 支持 tb001 / TB001 / tb1 / tb0001 等写法
        const match = textbookId.match(/^tb0*(\d+)$/i);
        if (match) {
            const n = Number.parseInt(match[1], 10);
            if (Number.isFinite(n) && n >= 1 && n <= LOCAL_COVER_MAX) {
                return `/images/book${n}.jpg`;
            }
        }
    }

    // 未知教材显示 book1
    return "/images/book1.jpg";
}
