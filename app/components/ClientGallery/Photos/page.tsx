"use client";
import React, { useEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import DownloadIcon from "@/public/assets/Icons/DownloadIcon";
import DownloadAllIcon from "@/public/assets/Icons/DownloadAllIcon";
import MyModal from "../DeleteImageModal";
import { useSearchParams } from "next/navigation";
import NavBar from "../../Navbar/page";
import Footer from "../../Footer";
import Loader from "../../Loader/Loader";
import UploadPhotoModal from "../UploadPhotoModal";
import { useDispatch, useSelector } from "react-redux";
import { initializeFolderClientGallery } from "@/app/redux/actions/clientGalleryAction";

interface PhotoProps {
  photos: any[];
  folderName: number;
}

// Circular loader component
const CircularLoader: React.FC = () => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );
};

interface FullScreenImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({
  imageUrl,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="max-w-3xl max-h-3/4">
        <button
          className="absolute top-2 right-2 text-white text-4xl"
          onClick={onClose}
        >
          &times;
        </button>
        <img src={imageUrl} alt="Full Screen" className="w-full scale-110" />
      </div>
    </div>
  );
};

const Photos = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const reduxPhotos = useSelector(
    (state) => (state as any).clientGalleryReducer.photos
  );
  const [photos, setPhotos] = useState<any>();
  const id = searchParams.get("id");
  const index = searchParams.get("index");
  const [loading, setloading] = useState(false);
  const [hitRedux, sethitRedux] = useState(0);
  const gDriveLinkRef = useRef<string>("");

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const navigateToGdrive = () => {
    window.open(gDriveLinkRef.current, "_blank");
  };

  useEffect(() => {
    setloading(true);
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          `/api/routes/Photo/ClientGallery/FindOne?id=${id}`,
          {
            method: "GET",
          }
        );
        const res = await response.json();
        console.log(res.clientGalleryExists);
        setPhotos(res.clientGalleryExists);  
        gDriveLinkRef.current = res.clientGalleryExists.link;
        console.log("link",res.clientGalleryExists.link)
        dispatch(initializeFolderClientGallery(res.clientGalleryExists));
        setloading(false);
      } catch (error) {
        console.log(error);
        setloading(false);
      }
    };
    fetchPhotos();
    if (reduxPhotos?.images) {
      setPhotos(reduxPhotos);
    }
    console.log(reduxPhotos);
  }, [hitRedux]);

  const downloadImage = (url: string, index: number) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `image_${index}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => console.error("Error downloading image:", error));
  };

  const openFullScreenImage = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };
 
  return !loading ? (
    <div className="bg-white text-black">
      <NavBar />
      <h1 className="flex justify-center w-full text-5xl my-5 font-bold tracking-wide">
        {photos?.name || "Client Gallery"}
      </h1>{" "}
      <div className=" flex justify-between px-4 py-2 items-center ">
        <div className="hover:bg-gray-200 mx-4 p-2 focus:bg-gray-200  rounded-lg">
          <UploadPhotoModal
            sethitRedux={sethitRedux}
            index={index}
            id={photos?._id}
          />
        </div>
        <div className="flex" >
          <button onClick={()=>navigateToGdrive()} className=" hidden cursor-pointer lg:inline-block py-3 px-6 bg-blue-500 hover:bg-blue-600 text-sm text-white font-bold rounded-xl transition duration-200">
            Download all
          </button>
        </div>
      </div>
      <div className="min-h-[90vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 justify-center">
  {photos?.images.map((image: any, index: number) => {
    return (
      <div className="m-4 md:h-[20rem]" key={image.url}>
        <div className="relative md:h-[20rem] ">
          <div className="z-20">
            <LazyLoadImage
              src={image.url}
              effect="blur"
              beforeLoad={() => setIsLoading(true)}
              onLoad={handleImageLoad}
              className="cursor-pointer md:h-[20rem] w-full object-cover"
              alt={`Image ${index}`}
              onClick={() => openFullScreenImage(image.url)}
            />
          </div>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CircularLoader />
            </div>
          )}
          {!isLoading && (
            <div className="absolute right-2 top-2">
              <div>
                <MyModal id={id} url={image.url} sethitRedux={sethitRedux} />
              </div>
              <button
                className="bg-blue-500 bg-opacity-60 mt-1 flex justify-center md:w-[2.5rem] px-2 py-2 rounded-sm"
                onClick={() => downloadImage(image.url, index)}
              >
                <DownloadIcon height={20} width={20} />
              </button>
            </div>
          )}
          {fullScreenImage === image.url && (
            <FullScreenImageModal
              imageUrl={image.url}
              onClose={closeFullScreenImage}
            />
          )}
        </div>
      </div>
    );
  })}
</div>

      </div>
      <Footer />
    </div>
  ) : (
    <div className="flex bg-white h-[100vh] items-center justify-center">
      <Loader />
    </div>
  );
};

export default Photos;
