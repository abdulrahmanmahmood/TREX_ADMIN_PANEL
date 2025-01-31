import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";

const CREATE_CHAPTER = gql`
  mutation CreateChapter($nameEn: String!, $nameAr: String!) {
    createChapter(createChapterInput: { nameEn: $nameEn, nameAr: $nameAr })
  }
`;

interface CreateChapterModalProps {
  onSuccess?: () => void;
}

const CreateChapterModal: React.FC<CreateChapterModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
  });

  const { execute: createChapter, isLoading } = useGenericMutation({
    mutation: CREATE_CHAPTER,
    onSuccess: () => {
      setOpen(false);
      setFormData({ nameAr: "", nameEn: "" });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating chapter:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createChapter({
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 ">
          <Plus className="w-4 h-4 mr-2" />
          Add New Chapter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Chapter</DialogTitle>
        </DialogHeader>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Chapter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChapterModal;
