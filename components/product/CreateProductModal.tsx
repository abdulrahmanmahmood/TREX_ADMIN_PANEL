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
import toast from "react-hot-toast/headless";

const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput)
  }
`;

interface CreateProductModalProps {
  onSuccess?: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    defaultDutyRate: 0,
    subChapterId: "",
    agreementId: "",
    serviceTax: false,
    adVAT: false,
  });

  const { execute: createProduct, isLoading } = useGenericMutation({
    mutation: CREATE_PRODUCT,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        HSCode: "",
        nameEn: "",
        nameAr: "",
        defaultDutyRate: 0,
        subChapterId: "",
        agreementId: "",
        serviceTax: false,
        adVAT: false,
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.log("Error creating product:", error);
      toast.error("Error creating product", {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createProduct({
      createProductInput: {
        ...formData,
        defaultDutyRate: Number(formData.defaultDutyRate),
        serviceTax: Boolean(formData.serviceTax),
        adVAT: Boolean(formData.adVAT),
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const finalValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="HSCode">HS Code</Label>
            <Input
              id="HSCode"
              name="HSCode"
              value={formData.HSCode}
              onChange={handleInputChange}
              placeholder="Enter HS Code"
              className="w-full"
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="defaultDutyRate">Default Duty Rate (%)</Label>
            <Input
              id="defaultDutyRate"
              name="defaultDutyRate"
              type="number"
              value={formData.defaultDutyRate}
              onChange={handleInputChange}
              placeholder="Enter duty rate"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subChapterId">Sub Chapter ID</Label>
            <Input
              id="subChapterId"
              name="subChapterId"
              value={formData.subChapterId}
              onChange={handleInputChange}
              placeholder="Enter sub chapter ID"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agreementId">Agreement ID</Label>
            <Input
              id="agreementId"
              name="agreementId"
              value={formData.agreementId}
              onChange={handleInputChange}
              placeholder="Enter agreement ID"
              className="w-full"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="serviceTax"
              name="serviceTax"
              checked={formData.serviceTax}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <Label htmlFor="serviceTax">Service Tax</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="adVAT"
              name="adVAT"
              checked={formData.adVAT}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <Label htmlFor="adVAT">VAT</Label>
          </div>

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

export default CreateProductModal;
