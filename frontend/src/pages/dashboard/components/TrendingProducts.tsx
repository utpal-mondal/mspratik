"use client";

import { ChevronRight, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ElementType } from "react";


interface TrendingTheme {
  card: string;
  icon: string;
  iconColor: string;
}

interface TrendingProduct {
  id:number;
  title: string;
  description: string;
  url: string;
  icon: ElementType;
  theme: TrendingTheme;
}

const iconMap: Record<string, ElementType> = {
  Store,
};


const trendingProducts= [
  {
    "id":15,
    "title": "A Fone Zone Cacem",
    "description": "Trending Product",
    "url": "/trending-products",
    "icon": "Store",
    "theme": {
      "card": "bg-[#B8860B] border-[#9A760A]",
      "icon": "bg-[#C7960C]",
      "iconColor": "text-white"
    }
  },
  {
    "id":13,
    "title": "AFZ ONLINE SHOP",
    "description": "Trending Product",
    "url": "/trending-products",
    "icon": "Store",
    "theme": {
      "card": "bg-[#008000] border-[#006E00]",
      "icon": "bg-[#129A12]",
      "iconColor": "text-white"
    }
  },
  {
    "id": 12,
    "title": "AMIR SHOP",
    "description": "Trending Product",
    "url": "/trending-products",
    "icon": "Store",
    "theme": {
      "card": "bg-[#A0522D] border-[#8A431F]",
      "icon": "bg-[#B56330]",
      "iconColor": "text-white"
    }
  }
]


export default function TrendingProducts() {
  const trendingCards: TrendingProduct[] = trendingProducts.map((card) => ({
    ...card,
    icon: iconMap[card.icon] ?? Store,
  }));

  const router= useRouter()

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {trendingCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              onClick={() => router.push(`${card.url}/${card.id}`)}
              
              className={`group relative block cursor-pointer overflow-hidden rounded-2xl border p-3 shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)] ${card.theme.card}`}
            >
              {/* Decorative circle */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />

              {/* Header */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.theme.icon} ${card.theme.iconColor}`}>
                  <Icon size={17} strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-bold text-white">
                    {card.title}
                  </h3>

                  <p className="truncate text-[10px] font-medium text-white/80 mb-1">
                    {card.description}
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="shrink-0 text-white/80 transition-all duration-200 group-hover:translate-x-0.5"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
