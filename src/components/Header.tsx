"use client";

import Link from "next/link";
import { useAppContext } from "../app/AppContext";

export default function Header() {
  const { language, setLanguage, isAdmin, setIsAdmin } = useAppContext();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
        <h1 className="text-xl font-bold hidden md:block">Notes CMS</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as "en" | "bn")}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
        >
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>

        {isAdmin && (
          <Link href="/add-content" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            {language === "en" ? "Add Content" : "কনটেন্ট যুক্ত করুন"}
          </Link>
        )}
      </div>
    </header>
  );
}
