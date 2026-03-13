import React from "react";
import { Library, Search, Tag, TrendingUp, Building2 } from "lucide-react";

export function EntityLibrary() {
  // Mock data - in a real app this would come from backend
  const entities = [
    {
      category: "Parties",
      icon: Building2,
      color: "indigo",
      count: 24,
      items: [
        { name: "TechCorp Inc.", frequency: 8, confidence: 98 },
        { name: "Global Solutions LLC", frequency: 6, confidence: 96 },
        { name: "Jane Smith", frequency: 5, confidence: 99 },
        { name: "ABC Enterprises", frequency: 5, confidence: 94 },
      ],
    },
    {
      category: "Governing Laws",
      icon: Tag,
      color: "emerald",
      count: 12,
      items: [
        { name: "New York", frequency: 7, confidence: 97 },
        { name: "California", frequency: 3, confidence: 95 },
        { name: "Delaware", frequency: 2, confidence: 98 },
      ],
    },
    {
      category: "Contract Terms",
      icon: TrendingUp,
      color: "amber",
      count: 18,
      items: [
        { name: "12 months", frequency: 6, confidence: 99 },
        { name: "24 months", frequency: 4, confidence: 97 },
        { name: "36 months", frequency: 3, confidence: 96 },
        { name: "6 months", frequency: 5, confidence: 98 },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {
        indigo: {
          bg: "bg-indigo-100",
          text: "text-indigo-600",
          border: "border-indigo-200",
        },
        emerald: {
          bg: "bg-emerald-100",
          text: "text-emerald-600",
          border: "border-emerald-200",
        },
        amber: {
          bg: "bg-amber-100",
          text: "text-amber-600",
          border: "border-amber-200",
        },
      };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Entity Library
          </h1>
          <p className="text-slate-600">
            Browse and manage extracted entities from analyzed documents
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search entities..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Entity Categories */}
        <div className="space-y-6">
          {entities.map((category) => {
            const colors = getColorClasses(category.color);
            return (
              <div
                key={category.category}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Category Header */}
                <div
                  className={`px-6 py-4 border-b ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}
                      >
                        <category.icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {category.category}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {category.count} unique entities
                        </p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      View All →
                    </button>
                  </div>
                </div>

                {/* Entity List */}
                <div className="divide-y divide-slate-200">
                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            Found in {item.frequency} document
                            {item.frequency !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">
                              Confidence
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${colors.bg.replace("100", "500")}`}
                                  style={{ width: `${item.confidence}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">
                                {item.confidence}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <Library className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-indigo-900 font-medium mb-1">
            Entity Library in Development
          </p>
          <p className="text-xs text-indigo-700">
            Advanced entity management with tagging, merging, and custom
            dictionaries coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
