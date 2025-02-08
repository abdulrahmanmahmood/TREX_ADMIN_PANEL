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

// GraphQL Queries remain the same
const GET_CHAPTERS = gql`
  query GetChapters {
    getChapters(extraFilter: { deleted: false }) {
      data {
        _id
        nameEn
        nameAr
      }
    }
  }
`;

const GET_SUBCHAPTERS = gql`
  query GetSubChaptersList {
    getSubChaptersList(extraFilter: { deleted: false }) {
      data {
        _id
        nameEn
        nameAr
      }
    }
  }
`;

const GET_PRODUCTS = gql`
  query AllProducts {
    allProducts {
      data {
        _id
        HSCode
        nameEn
        nameAr
      }
    }
  }
`;

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
    chapterIds: [] as string[],
    subChapterIds: [] as string[],
    productIds: [] as string[],
  });

  // Fetch data
  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });
  const { data: subChaptersData } = useGenericQuery({ query: GET_SUBCHAPTERS });
  const { data: productsData } = useGenericQuery({ query: GET_PRODUCTS });

  // Mutation for creating a measurement
  const { execute: createMeasurement, isLoading } = useGenericMutation({
    mutation: CREATE_MEASUREMENT,
    onSuccess: () => {
      toast.success("Measurement created successfully!");
      setOpen(false);
      setFormData({
        unitName: "",
        chapterIds: [],
        subChapterIds: [],
        productIds: [],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error creating measurement: ${error.message}`);
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted");

    if (!open) {
      console.log("Modal is closed, cannot submit");
      return;
    }

    // Convert arrays to comma-separated strings
    const variables = {
      createMeasurementInput: {
        unitName: formData.unitName,
        chapterIds: formData.chapterIds.join(","),
        subChapterIds: formData.subChapterIds.join(","),
        productIds: formData.productIds.join(","),
      },
    };

    console.log("Form Data State:", formData);
    console.log("Mutation Input:", variables);

    try {
      const result = await createMeasurement(variables);
      console.log("Mutation Result:", result);
    } catch (error) {
      console.error("Error creating measurement:", error);
    }
  };

  // Handle multi-select changes
  const handleMultiSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
    fieldName: string
  ) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedOptions,
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unitName: e.target.value }))
              }
              required
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Chapters Multi-select */}
          <div className="space-y-2">
            <Label htmlFor="chapters">Chapters</Label>
            <select
              id="chapters"
              multiple
              value={formData.chapterIds}
              onChange={(e) => handleMultiSelect(e, "chapterIds")}
              className="w-full p-2 border rounded min-h-[100px]"
            >
              {chaptersData?.getChapters?.data.map(
                (chapter: { _id: string; nameEn: string; nameAr: string }) => (
                  <option key={chapter._id} value={chapter._id}>
                    {chapter.nameEn} - {chapter.nameAr}
                  </option>
                )
              )}
            </select>
            <p className="text-sm text-gray-500">
              Hold Ctrl (Windows) or Command (Mac) to select multiple items
            </p>
          </div>

          {/* SubChapters Multi-select */}
          <div className="space-y-2">
            <Label htmlFor="subchapters">SubChapters</Label>
            <select
              id="subchapters"
              multiple
              value={formData.subChapterIds}
              onChange={(e) => handleMultiSelect(e, "subChapterIds")}
              className="w-full p-2 border rounded min-h-[100px]"
            >
              {subChaptersData?.getSubChaptersList?.data.map(
                (subChapter: {
                  _id: string;
                  nameEn: string;
                  nameAr: string;
                }) => (
                  <option key={subChapter._id} value={subChapter._id}>
                    {subChapter.nameEn} - {subChapter.nameAr}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Products Multi-select */}
          <div className="space-y-2">
            <Label htmlFor="products">Products</Label>
            <select
              id="products"
              multiple
              value={formData.productIds}
              onChange={(e) => handleMultiSelect(e, "productIds")}
              className="w-full p-2 border rounded min-h-[100px]"
            >
              {productsData?.allProducts?.data.map(
                (product: { _id: string; nameEn: string; HSCode: string }) => (
                  <option key={product._id} value={product._id}>
                    {product.nameEn} - {product.HSCode}
                  </option>
                )
              )}
            </select>
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
