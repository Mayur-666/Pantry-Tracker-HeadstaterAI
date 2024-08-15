"use client";
import { firestore } from "@/firebase";
import { useEffect, useState } from "react";
import {
  query,
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [debounceId, setDebounceId] = useState(null);

  //updating inventory
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    console.log(docs);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  //removing item from inventory
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  //adding item from inventory
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
    handleClose();
  };

  // when page loads first time
  useEffect(() => {
    // we need to update inventory
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //for searching item with debounce concept
  useEffect(() => {
    if (debounceId !== null) {
      clearTimeout(debounceId);
    }

    let timeout = setTimeout(() => {
      function handleSearch() {
        

        inventory.forEach((item) => {
          if (searchItem.length > 0 && item.name.includes(searchItem)) {
            let i = document.getElementById(item.name);

            i.style.border = "2px solid rgb(35,70,0)";
            i.style.transform = "scale(1.03)"

          } else {
            let i = document.getElementById(item.name);

            i.style.border = "";
            i.style.transform = "scale(1)"
          }
        });
      }
      handleSearch();
    }, 300);

    setDebounceId(timeout);

    return () => clearTimeout(timeout);
  }, [searchItem]);

  return (
    <div className="w-full h-dvh p-5 font-serif mx-auto flex items-center justify-start flex-col bg-slate-200">
      <h1 className="p-5 text-4xl mx-auto text-center">Inventory Management</h1>
      <div className="w-10/12 max-w-1/2 px-1 flex flex-col sm:flex-row items-center justify-center">
        <input
          placeholder="Search items"
          className="w-full sm:w-1/2 p-2 rounded-sm bg-transparent outline-none border border-gray-600 mx-4"
          onChange={(e) => setSearchItem(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 mx-2 w-full sm:w-48 hover:bg-blue-100 border-blue-500 border hover:text-blue-600 rounded-md my-4"
          onClick={handleOpen}
        >
          🞦 Add Item
        </button>
      </div>
        <h2 className="m-2 w-10/12 sm:w-9/12 md:w-7/12 max-w-2/3 mx-auto text-xl bg-gray-600 text-white flex items-center justify-center px-4 py-2">
          Inventory Items
        </h2>
      <div className="w-11/12 sm:w-9/12 md:w-7/12 max-w-2/3 mx-auto flex flex-col items-center px-5 py-1 max-h-96 overflow-y-scroll border-gray-600 border">
        {inventory && inventory.length > 0 ? (
          inventory.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border border-gray-600 w-full p-5 my-2 bg-gray-300"
              id={item.name}
            >
              <h1 className="w-2/4  font-semibold">
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </h1>
              <p className="w-2/4 text-center">Quantity: {item.quantity}</p>
              <button
                className="w-8 h-8 hover:opacity-65"
                onClick={() => removeItem(item.name)}
              >
                ❌
              </button>
            </div>
          ))
        ) : (
          <div className="text-center border border-gray-600 w-full p-5 my-1 bg-gray-300">
            No items present in inventory.
          </div>
        )}
      </div>
      <Modal open={open} close={handleClose} addItem={addItem} />
    </div>
  );
}

function Modal({ open, close, addItem }) {
  const [itemName, setItemName] = useState("");

  const handleInputChange = (e) => {
    e.preventDefault();
    setItemName(e.target.value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(itemName);
    } else if (e.key === "Escape") {
      close();
    }
  };

  return (
    open && (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
        <div className="w-52 h-52 bg-white flex items-center justify-center flex-col p-5 rounded-md relative">
          <button
            className="absolute right-0 top-0 rounded-full w-6 h-6 text-xs text-center flex items-center justify-center m-2 hover:opacity-60 font-bold"
            onClick={close}
          >
            ❌
          </button>
          <h1 className="text-2xl" onClick={() => addItem(itemName)}>
            Add Item
          </h1>
          <input
            type="text"
            placeholder="Enter Item Name"
            className="w-10/12 mt-2 mb-4 px-1 py-2 text-center outline-none border-2 border-gray-500 overflow-x-scroll overflow-y-hidden"
            onChange={handleInputChange}
            onKeyUp={handleKeyDown}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 mx-2 w-24 hover:bg-blue-100 border-blue-500 border hover:text-blue-600 rounded-lg"
            onClick={(e) => {
              e.preventDefault();
              itemName.length > 0 && addItem(itemName);
              setItemName("");
            }}
          >
            Add
          </button>
        </div>
      </div>
    )
  );
}
