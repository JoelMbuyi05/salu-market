export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-border">
            {/* image skeleton */}
            <div className="h-40 w-full bg-light-bg animate-pulse" />

            {/* info skeleton */}
            <div className="p-2 flex flex-col gap-2">
                {/* title */}
                <div className="h-3 bg-light-bg rounded animate-pulse w-full" />
                <div className="h-3 bg-light-bg rounded animate-pulse w-3/4" />
                {/* price */}
                <div className="h-4 bg-light-bg rounded animate-pulse w-1/2" />
                {/* location */}
                <div className="h-3 bg-light-bg rounded animate-pulse w-2/3" />
            </div>
        </div>
    )
}