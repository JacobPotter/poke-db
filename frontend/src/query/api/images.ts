export function getImagesQueryOptions(imageUrls: string[]) {
    const queryKey = ['images', {images: imageUrls}];
    return {
        queryKey,
        queryFn: async () => {
            const promises = imageUrls.map((url) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.src = url;
                });
            });

            return await Promise.all(promises);
        },
    };
}
