import { useState } from "react";
import "./style/style.css"
const categories = ["Tay cầm", "Tai nghe", "Gia dụng"];
const products = {
  "Tay cầm": ["/assets/gamepad.png", "/assets/gamepad.png", "/assets/gamepad.png"],
  "Tai nghe": ["/assets/headphone.png", "/assets/headphone.png", "/assets/headphone.png"],
  "Gia dụng": ["/assets/home-appliance.png", "/assets/home-appliance.png"],
};

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Tay cầm");

  return (
    <div className="cangiua">
    <div className="flex flex-col items-center p-6">
      {/* Banner */}
      <img src="/assets/banner.webp" alt="Banner" className="w-full max-w-4xl shadow-lg rounded-lg" />

      {/* Danh mục */}
      <div className="flex gap-4 my-6">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 bg-white shadow-md rounded-lg ${
              selectedCategory === category ? "bg-blue-500 text-white" : "text-black"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sản phẩm */}
      <div className="grid grid-cols-3 gap-6">
        {products[selectedCategory].map((product, index) => (
          <div key={index} className="shadow-lg p-4 rounded-lg bg-white">
            <img src={product} alt="Sản phẩm" className="w-40 h-40 mx-auto" />
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default HomePage;
