import React, { useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { toast } from "react-hot-toast";

// GraphQL Queries
const GET_CHAPTERS = gql`
  query GetChapters {
    getChapters(pageable: { page: 0 }) {
      data {
        _id
        nameEn
      }
    }
  }
`;

// GraphQL Mutation
const CREATE_MEASUREMENT = gql`
  mutation CreateMeasurement($createMeasurementInput: CreateMeasurementInput!) {
    createMeasurement(createMeasurementInput: $createMeasurementInput)
  }
`;

interface CreateMeasurementModalProps {
  onSuccess?: () => void;
}

const CreateMeasurementModal: React.FC<CreateMeasurementModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    unitName: "",
    chapterIds: "",
    subChapterIds: "",
    productIds: "",
  });

  // Fetch Chapters for selection
  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });

  // Mutation for creating a measurement
  const { execute: createMeasurement, isLoading } = useGenericMutation({
    mutation: CREATE_MEASUREMENT,
    onSuccess: () => {
      toast.success("Measurement created successfully!");
      setOpen(false);
      setFormData({
        unitName: "",
        chapterIds: "",
        subChapterIds: "",
        productIds: "",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error creating measurement: ${error.message}`);
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMeasurement({
      variables: {
        createMeasurementInput: {
          unitName: formData.unitName,
          chapterIds: formData.chapterIds || null,
          subChapterIds: formData.subChapterIds || null,
          productIds: formData.productIds || null,
        },
      },
    });
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Measurement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit Name */}
          <div className="space-y-2">
            <Label htmlFor="unitName">Unit Name</Label>
            <Input
              id="unitName"
              name="unitName"
              value={formData.unitName}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Chapters Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="chapterIds">Chapter</Label>
            <select
              id="chapterIds"
              name="chapterIds"
              value={formData.chapterIds}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select a Chapter</option>
              {chaptersData?.getChapters?.data.map(
                (chapter: { _id: string; nameEn: string }) => (
                  <option key={chapter._id} value={chapter._id}>
                    {chapter.nameEn}
                  </option>
                )
              )}
            </select>
          </div>

          {/* SubChapter ID (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="subChapterIds">SubChapter ID</Label>
            <Input
              id="subChapterIds"
              name="subChapterIds"
              value={formData.subChapterIds}
              onChange={handleInputChange}
              placeholder="Optional"
            />
          </div>

          {/* Product ID (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="productIds">Product ID</Label>
            <Input
              id="productIds"
              name="productIds"
              value={formData.productIds}
              onChange={handleInputChange}
              placeholder="Optional"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeasurementModal;
