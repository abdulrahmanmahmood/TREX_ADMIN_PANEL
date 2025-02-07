import React, { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { toast } from "react-hot-toast";

// Query to get chapter by ID
const GET_CHAPTER_BY_ID = gql`
  query Chapter($id: ID!) {
    chapter(id: $id) {
      _id
      nameEn
      nameAr
    }
  }
`;

// Mutation to update chapter
const UPDATE_CHAPTER = gql`
  mutation UpdateChapter($chapterInput: UpdateChapterDTO!) {
    updateChapter(chapterInput: $chapterInput) {
      _id
      nameEn
      nameAr
    }
  }
`;

interface UpdateChapterModalProps {
  chapterId: string; // ID of the chapter to be updated
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateChapterModal: React.FC<UpdateChapterModalProps> = ({
  chapterId,
  onSuccess,
  onClose,
}) => {
  console.log("chapterId:", chapterId);

  // Fetch existing chapter data
  const { data, loading: queryLoading } = useGenericQuery({
    query: GET_CHAPTER_BY_ID,
    variables: { id: chapterId },
  });

  // State for form data
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
  });

  // Mutation for updating chapter
  const { execute: updateChapter, isLoading: mutationLoading } =
    useGenericMutation({
      mutation: UPDATE_CHAPTER,
      onSuccess: () => {
        toast.success("Chapter updated successfully!");
        onSuccess?.(); // Optionally refetch or update UI
        onClose(); // Close modal after success
      },
      onError: (error) => {
        toast.error(`Error updating chapter: ${error.message}`);
      },
    });

  // Populate form data when chapter data is fetched
  useEffect(() => {
    if (data?.chapter) {
      setFormData({
        nameEn: data.chapter.nameEn,
        nameAr: data.chapter.nameAr,
      });
    }
  }, [data]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateChapter({
      variables: {
        chapterInput: {
          id: chapterId,
          nameEn: formData.nameEn,
          nameAr: formData.nameAr,
        },
      },
    });
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Chapter</DialogTitle>
        </DialogHeader>
        {queryLoading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name</Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                placeholder="Enter Arabic name"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name</Label>
              <Input
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                placeholder="Enter English name"
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutationLoading}>
              {mutationLoading ? "Updating..." : "Update Chapter"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateChapterModal;
