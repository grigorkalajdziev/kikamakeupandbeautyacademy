import { IoIosStar, IoIosStarOutline } from "react-icons/io";
const ProductRating = ({ ratingValue }: { ratingValue?: number }) => {
  const stars = Array.from({ length: 5 }, (_, i) =>
    ratingValue && i < Math.round(ratingValue)
      ? <IoIosStar key={i} className="text-amber-400" />
      : <IoIosStarOutline key={i} className="text-amber-400" />
  );
  return <>{stars}</>;
};
export default ProductRating;
