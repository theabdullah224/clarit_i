"use client";

import Spinner from "@/app/components/Spinner";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DeleteBtn = ({ contractId }: { contractId: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function deleteContract(contractId: string) {
    try {
      setIsDeleting(true);
      const res = await axios.delete("/api/analyzedReports/" + contractId);
      if (res.status == 200) {
        router.push("/home");
        router.refresh();
      } else if (res.status == 500) {
        setError("UnExpected Error Occur");
        setIsDeleting(false);
      }
    } catch (err) {
      console.log(err);
      setIsDeleting(false);
    }
  }
  return (
    <>
      <button
        className="bg-red-500 flex gap-3 items-center text-white p-2 rounded-md"
        disabled={isDeleting}
        onClick={() => deleteContract(contractId)}
      >
        <MdDelete /> Delete Report {isDeleting && <Spinner />}
      </button>
      {error && <p className="text-sm">{error}</p>}
    </>
  );
};
export default DeleteBtn;
