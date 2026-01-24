"use client";
import { ChevronLeft, X, Search } from "lucide-react";
import React, { useState, useRef,useEffect,useCallback  } from "react";
import { useSearchState } from '@/hooks/useSearchState';
import { useRouter, useSearchParams } from 'next/navigation';


function CategoryTabs({ onClose, activeCategory, setActiveCategory }: { 
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}) {
  const categories = [
    { id: 'homes', icon: '🏠', label: 'Homes' },
    { id: 'services', icon: '🔔', label: 'Services' },
    { id: 'stories', icon: '📖', label: 'Stories' },
  ];

  return (
    <div className="flex gap-8 justify-center border-b border-gray-200 px-4 bg-white">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`py-4 font-semibold flex flex-col items-center gap-1 ${
            activeCategory === cat.id
              ? 'text-gray-800 border-b-2 border-black'
              : 'text-gray-400'
          }`}
        >
          <span className="text-xl">{cat.icon}</span>
          <span className="text-xs">{cat.label}</span>
        </button>
      ))}
      <button className="absolute right-4 top-4 p-2"
       onClick={onClose}>
        <X size={24} className="text-gray-600" />
      </button>
    </div>
  );
}

function Calendar({ onNext, dateRange, setDateRange }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0));
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });

  const daysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth(currentDate) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(currentDate) }, () => null);

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: newDate, end: null });
    } else {
      if (newDate < selectedDates.start) {
        setSelectedDates({ start: newDate, end: selectedDates.start });
      } else {
        setSelectedDates({ start: selectedDates.start, end: newDate });
      }
    }
  };

  const isDateInRange = (day) => {
    if (!selectedDates.start) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (!selectedDates.end) return date.getTime() === selectedDates.start.getTime();
    return date >= selectedDates.start && date <= selectedDates.end;
  };

  const isStartOrEnd = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return (
      (selectedDates.start && date.getTime() === selectedDates.start.getTime()) ||
      (selectedDates.end && date.getTime() === selectedDates.end.getTime())
    );
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-gray-800">When?</h3>

        {/* Tabs */}
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-800 rounded-full text-sm font-medium text-gray-800">
            Dates
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100">
            Months
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100">
            Flexible
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
              )
            }
            className="text-gray-600 hover:text-gray-800 text-lg"
          >
            ←
          </button>
          <h4 className="text-gray-800 font-semibold text-center">{monthYear}</h4>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
              )
            }
            className="text-gray-600 hover:text-gray-800 text-lg"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d} className="text-xs font-semibold text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const inRange = isDateInRange(day);
            const isStartOrEndDay = isStartOrEnd(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`py-2 text-sm font-medium rounded-lg transition ${
                  isStartOrEndDay
                    ? "bg-gray-800 text-white font-bold"
                    : inRange
                    ? "bg-gray-200 text-gray-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flexible options */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 border border-gray-800 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-50">
          Exact dates
        </button>
        <button className="flex-1 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50">
          ± 1 day
        </button>
        <button className="flex-1 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50">
          ± 2 days
        </button>
      </div>
    </div>
  );
}

export default function MobileSearchSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {

   if (!open) return null;
  
  // Use shared search state hook
  const {
    selectedCity,
    setSelectedCity,
    dateRange,
    setDateRange,
    guestCounts,
    setGuestCounts,
    recentSearches,
    totalGuests,
    saveSearchState,
    addToRecentSearches,
    updateGuestCount,
    getGuestDisplayText
  } = useSearchState();
  
  const [activeStep, setActiveStep] = useState("where");
  const [whereSearch, setWhereSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState('homes');
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragging, setDragging] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    if (!dragging || !sheetRef.current) return;
    currentY.current = e.touches[0].clientY - startY.current;
    if (currentY.current > 0) {
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
    }
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (!sheetRef.current) return;
    if (currentY.current > 120) {
      onClose();
    } else {
      sheetRef.current.style.transform = `translateY(0px)`;
    }
    currentY.current = 0;
  };

  const destinations = [
    { name: "Nearby", desc: "Find what's around you", icon: "✈️" },
    { name: "South Goa, Goa", desc: "Popular beach destination", icon: "🏖️" },
    { name: "North Goa, Goa", desc: "For sights like Fort Aguada", icon: "🏰" },
    { name: "Panaji, Goa", desc: "A hidden gem", icon: "💎" },
    { name: "Palolem Beach", desc: "For its seaside allure", icon: "🏝️" },
    { name: "Calangute, Goa", desc: "For its bustling nightlife", icon: "🎉" },
    { name: "Majorda, Goa", desc: "Off the beaten path", icon: "🌲" },
  ];


  
 const handleSearch = () => {
    if (!selectedCity) return;
    
    // Save current search state before navigating
    saveSearchState();
    
    // Add to recent searches
    if (dateRange.startDate && dateRange.endDate) {
      const datesStr = `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;
      addToRecentSearches(selectedCity.label, datesStr);
    }
    
    // Navigate to search results
    const params = new URLSearchParams({
      city: selectedCity.value,
      guests: totalGuests.toString(),
      adults: guestCounts.adults.toString(),
      children: guestCounts.children.toString(),
      infants: guestCounts.infants.toString(),
      checkIn: dateRange.startDate?.toISOString().split('T')[0] || '',
      checkOut: dateRange.endDate?.toISOString().split('T')[0] || '',
    });

    let searchUrl = '/search';
  if (activeCategory === 'services') {
    searchUrl = '/search/services';
  } else if (activeCategory === 'stories') {
    searchUrl = '/search/stories';
  }

    window.location.href = `${searchUrl}?${params.toString()}`;
    onClose();
  };

  

useEffect(() => {
  if (activeCategory === 'homes' && selectedCity) {
    saveSearchState();
  }
}, [selectedCity, dateRange, guestCounts]);

useEffect(() => {
  if (activeCategory !== 'homes') {
    setSelectedCity(null);
    setDateRange({ startDate: null, endDate: null, key: 'selection' });
    setGuestCounts({ adults: 2, children: 0, infants: 0 });
  }
}, [activeCategory]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[60]">
      <div
        className="absolute inset-0 pointer-events-none"
        // onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full bg-white rounded-t-3xl flex flex-col overflow-hidden"
        style={{ height: '95dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Category Tabs */}
        {/* <div className="relative">
          <CategoryTabs onClose={onClose} />
        </div> */}

        <CategoryTabs 
        onClose={onClose} 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">

             {activeCategory === 'homes' && (
              <>

            {/* WHERE - Always Visible but Collapses */}
            <div
              className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                activeStep === "where" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => activeStep !== "where" && setActiveStep("where")}
            >
              {activeStep === "where" ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">Where?</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search destinations"
                      value={whereSearch}
                      onChange={(e) => setWhereSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-800 text-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    {destinations.map((dest, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCity({ value: dest.name, label: dest.name });
                         
                         setWhereSearch(dest.name);
                           
                          setActiveStep("when");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-1">{dest.icon}</span>
                          <div>
                            <div className="text-gray-800 font-semibold">{dest.name}</div>
                            <div className="text-sm text-gray-500">{dest.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Where</span>
                  <span className="text-gray-800 font-semibold">{selectedCity?.label || "Add location"}</span>
                </div>
              )}
            </div>

            {/* WHEN - Collapses when not active */}
            {selectedCity && (
              <div
                className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                  activeStep === "when" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => activeStep !== "when" && setActiveStep("when")}
              >
                {activeStep === "when" ? (
                  <Calendar 
                    onNext={() => setActiveStep("who")} 
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">When</span>
                    <span className="text-gray-800 font-semibold">
                      {dateRange.startDate && dateRange.endDate 
                        ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                        : "Add dates"
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* WHO - Collapses when not active */}
            {selectedCity && (
              <div
                className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                  activeStep === "who" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => activeStep !== "who" && setActiveStep("who")}
              >
                {activeStep === "who" ? (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800">Who?</h3>

                    {/* Adults */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-800 font-semibold">Adults</div>
                        <div className="text-sm text-gray-500">Ages 13 or above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('adults', false)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          −
                        </button>
                        <span className="text-gray-800 font-semibold w-4 text-center">
                          {guestCounts.adults}
                        </span>
                        <button
                          onClick={() => updateGuestCount('adults', true)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-800 font-semibold">Children</div>
                        <div className="text-sm text-gray-500">Ages 2-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('children', false)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          −
                        </button>
                        <span className="text-gray-800 font-semibold w-4 text-center">
                          {guestCounts.children}
                        </span>
                        <button
                          onClick={() => updateGuestCount('children', true)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-800 font-semibold">Infants</div>
                        <div className="text-sm text-gray-500">Under 2</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('infants', false)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          −
                        </button>
                        <span className="text-gray-800 font-semibold w-4 text-center">
                          {guestCounts.infants}
                        </span>
                        <button
                          onClick={() => updateGuestCount('infants', true)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Who</span>
                    <span className="text-gray-800 font-semibold">{getGuestDisplayText()}</span>
                  </div>
                )}
              </div>
            )}
            </>
             )}

             {activeCategory === 'services' && (
      // Services search content
             
                   <>

                    {/* WHERE - Always Visible but Collapses */}
                    <div
                      className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                        activeStep === "where" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => activeStep !== "where" && setActiveStep("where")}
                    >
                      {activeStep === "where" ? (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-800">Where?</h2>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                              type="text"
                              placeholder="Search services"
                              value={whereSearch}
                              onChange={(e) => setWhereSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-800 text-gray-800"
                            />
                          </div>
                          <div className="space-y-2">
                            {destinations.map((dest, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedCity({ value: dest.name, label: dest.name });
                                  setActiveStep("when");
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl mt-1">{dest.icon}</span>
                                  <div>
                                    <div className="text-gray-800 font-semibold">{dest.name}</div>
                                    <div className="text-sm text-gray-500">{dest.desc}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Where</span>
                          <span className="text-gray-800 font-semibold">{selectedCity?.label || "Add location"}</span>
                        </div>
                      )}
                    </div>

                    {/* WHEN - Collapses when not active */}
                    {selectedCity && (
                      <div
                        className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                          activeStep === "when" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => activeStep !== "when" && setActiveStep("when")}
                      >
                        {activeStep === "when" ? (
                          <Calendar 
                            onNext={() => setActiveStep("who")} 
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                          />
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">When</span>
                            <span className="text-gray-800 font-semibold">
                              {dateRange.startDate && dateRange.endDate 
                                ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                                : "Add dates"
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* WHO - Collapses when not active */}
                    {selectedCity && (
                      <div
                        className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                          activeStep === "who" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => activeStep !== "who" && setActiveStep("who")}
                      >
                        {activeStep === "who" ? (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800">Who?</h3>

                            {/* Adults */}
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-gray-800 font-semibold">Adults</div>
                                <div className="text-sm text-gray-500">Ages 13 or above</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateGuestCount('adults', false)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  −
                                </button>
                                <span className="text-gray-800 font-semibold w-4 text-center">
                                  {guestCounts.adults}
                                </span>
                                <button
                                  onClick={() => updateGuestCount('adults', true)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Children */}
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-gray-800 font-semibold">Children</div>
                                <div className="text-sm text-gray-500">Ages 2-12</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateGuestCount('children', false)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  −
                                </button>
                                <span className="text-gray-800 font-semibold w-4 text-center">
                                  {guestCounts.children}
                                </span>
                                <button
                                  onClick={() => updateGuestCount('children', true)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Infants */}
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-gray-800 font-semibold">Infants</div>
                                <div className="text-sm text-gray-500">Under 2</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateGuestCount('infants', false)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  −
                                </button>
                                <span className="text-gray-800 font-semibold w-4 text-center">
                                  {guestCounts.infants}
                                </span>
                                <button
                                  onClick={() => updateGuestCount('infants', true)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Who</span>
                            <span className="text-gray-800 font-semibold">{getGuestDisplayText()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    </>
             
            )}
                {activeCategory === 'stories' && (
                  // Stories search content
                <>

                        {/* WHERE - Always Visible but Collapses */}
                        <div
                          className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                            activeStep === "where" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          onClick={() => activeStep !== "where" && setActiveStep("where")}
                        >
                          {activeStep === "where" ? (
                            <div className="space-y-4">
                              <h2 className="text-2xl font-bold text-gray-800">Where?</h2>
                              <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                  type="text"
                                  placeholder="Search Stories"
                                  value={whereSearch}
                                  onChange={(e) => setWhereSearch(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-800 text-gray-800"
                                />
                              </div>
                              <div className="space-y-2">
                                {destinations.map((dest, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setSelectedCity({ value: dest.name, label: dest.name });
                                      setActiveStep("when");
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
                                  >
                                    <div className="flex items-start gap-3">
                                      <span className="text-2xl mt-1">{dest.icon}</span>
                                      <div>
                                        <div className="text-gray-800 font-semibold">{dest.name}</div>
                                        <div className="text-sm text-gray-500">{dest.desc}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">Where</span>
                              <span className="text-gray-800 font-semibold">{selectedCity?.label || "Add location"}</span>
                            </div>
                          )}
                        </div>

                        {/* WHEN - Collapses when not active */}
                        {selectedCity && (
                          <div
                            className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                              activeStep === "when" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                            }`}
                            onClick={() => activeStep !== "when" && setActiveStep("when")}
                          >
                            {activeStep === "when" ? (
                              <Calendar 
                                onNext={() => setActiveStep("who")} 
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                              />
                            ) : (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">When</span>
                                <span className="text-gray-800 font-semibold">
                                  {dateRange.startDate && dateRange.endDate 
                                    ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                                    : "Add dates"
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* WHO - Collapses when not active */}
                        {selectedCity && (
                          <div
                            className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                              activeStep === "who" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                            }`}
                            onClick={() => activeStep !== "who" && setActiveStep("who")}
                          >
                            {activeStep === "who" ? (
                              <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-800">Who?</h3>

                                {/* Adults */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-gray-800 font-semibold">Adults</div>
                                    <div className="text-sm text-gray-500">Ages 13 or above</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateGuestCount('adults', false)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      −
                                    </button>
                                    <span className="text-gray-800 font-semibold w-4 text-center">
                                      {guestCounts.adults}
                                    </span>
                                    <button
                                      onClick={() => updateGuestCount('adults', true)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Children */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-gray-800 font-semibold">Children</div>
                                    <div className="text-sm text-gray-500">Ages 2-12</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateGuestCount('children', false)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      −
                                    </button>
                                    <span className="text-gray-800 font-semibold w-4 text-center">
                                      {guestCounts.children}
                                    </span>
                                    <button
                                      onClick={() => updateGuestCount('children', true)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Infants */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-gray-800 font-semibold">Infants</div>
                                    <div className="text-sm text-gray-500">Under 2</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateGuestCount('infants', false)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      −
                                    </button>
                                    <span className="text-gray-800 font-semibold w-4 text-center">
                                      {guestCounts.infants}
                                    </span>
                                    <button
                                      onClick={() => updateGuestCount('infants', true)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Who</span>
                                <span className="text-gray-800 font-semibold">{getGuestDisplayText()}</span>
                              </div>
                            )}
                          </div>
                        )}
                        </>
                )}
          </div>
          
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          <button 
            onClick={() => {
              setSelectedCity(null);
              setDateRange({ startDate: null, endDate: null, key: 'selection' });
              setGuestCounts({ adults: 2, children: 0, infants: 0 });
              setActiveStep("where");
            }}
            className="text-red-600 font-semibold hover:text-red-700"
          >
            Clear all
          </button>
          <button
            // onClick={() => {
            //   if (activeStep === "where") setActiveStep("when");
            //   else if (activeStep === "when") setActiveStep("who");
            //   else handleSearch();
            // }}
            onClick={() => {
    if (activeStep === "where") {
      if (whereSearch.trim()) {
        setSelectedCity({
          value: whereSearch.trim(),
          label: whereSearch.trim()
        });
      }
      setActiveStep("when");
    } else if (activeStep === "when") {
      setActiveStep("who");
    } else handleSearch();
  }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            {activeStep === "who" ? "Search" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}



