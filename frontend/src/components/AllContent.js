import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllContent = () => {
  // State to store the fetched contents
  const [contents, setContents] = useState([]);
  
  // State to manage loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch contents
    const fetchContents = async () => {
      try {
        // Reset states before fetching
        setIsLoading(true);
        setError(null);

        // Make GET request to the API
        const response = await axios.get('http://localhost:8000/api/v1/all-contents');
        
        console.log(response.data);
        // Update contents state with fetched data
        setContents(response.data);
        
        // Set loading to false
        setIsLoading(false);
      } catch (err) {
        // Handle any errors during fetching
        setError(err.message);
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchContents();
  }, []); // Empty dependency array means this runs once on component mount

  // Render loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render fetched contents
  return (
    <div className="all-content">
      <h1>All Contents</h1>
      {contents.length === 0 ? (
        <p>No contents found.</p>
      ) : (
        <ul>
          {contents.map((content, index) => (
            <li key={index}>
              {/* Adjust the rendering based on your actual content structure */}
              {JSON.stringify(content)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllContent;








// import axios from 'axios';

// const products = [
//     {
//       id: 1,
//       name: 'Earthen Bottle',
//       href: '#',
//       price: '$48',
//       imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-01.jpg',
//       imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
//     },
//     {
//       id: 2,
//       name: 'Nomad Tumbler',
//       href: '#',
//       price: '$35',
//       imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-02.jpg',
//       imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
//     },
//     {
//       id: 3,
//       name: 'Focus Paper Refill',
//       href: '#',
//       price: '$89',
//       imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-03.jpg',
//       imageAlt: 'Person using a pen to cross a task off a productivity paper card.',
//     },
//     {
//       id: 4,
//       name: 'Machined Mechanical Pencil',
//       href: '#',
//       price: '$35',
//       imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-04.jpg',
//       imageAlt: 'Hand holding black machined steel mechanical pencil with brass tip and top.',
//     },
//     // More products...
//   ]
  
// const AllContent = async() => {
//     const result = await axios.get('http://localhost:8000/api/v1/all-contents');

//     return (
//       <div className="bg-white">
//         <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
//           <h2 className="sr-only">Contents</h2>
  
//           <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
//             {products.map((content) => (
//               <a key={content.id} href={content.href} className="group">
//                 <img
//                   alt={content.imageAlt}
//                   src={content.imageSrc}
//                   className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-[7/8]"
//                 />
//                 <h3 className="mt-4 text-sm text-gray-700">{content.name}</h3>
//                 <p className="mt-1 text-lg font-medium text-gray-900">{content.price}</p>
//                 <button
//                 type="submit"
//                 className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-slate-100 px-8 py-3 text-base font-medium text-black hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
//               >
//                 Buy licence
//               </button>
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   export default AllContent;