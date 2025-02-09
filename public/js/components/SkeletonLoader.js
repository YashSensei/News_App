export class SkeletonLoader {
    static getCardSkeleton() {
        return `
            <article class="bg-news-card rounded-lg overflow-hidden shadow-lg animate-pulse">
                <div class="h-48 bg-gray-800"></div>
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="h-4 bg-gray-800 rounded w-1/4"></div>
                        <div class="h-4 bg-gray-800 rounded w-1/4"></div>
                    </div>
                    <div class="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-800 rounded w-full mb-2"></div>
                    <div class="h-4 bg-gray-800 rounded w-2/3"></div>
                    <div class="flex justify-end mt-4">
                        <div class="h-8 bg-gray-800 rounded w-24"></div>
                    </div>
                </div>
            </article>
        `;
    }

    static getMultipleSkeletons(count = 6) {
        return Array(count).fill(this.getCardSkeleton()).join('');
    }
} 