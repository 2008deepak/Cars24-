import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-3">
              <span className="bg-blue-600 text-white font-extrabold text-lg px-3 py-1 rounded-md">
                CARS
              </span>
              <span className="text-orange-500 font-extrabold text-lg ml-0.5">
                24
              </span>
            </div>
            <p className="text-sm text-gray-500">
              India&apos;s most trusted used car platform
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600">Help Center</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>123 Cars24 Lane, Mumbai</li>
              <li>1800-123-4567</li>
              <li>support@cars24.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-400">
          &copy; 2024 Cars24 Clone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
