import React, { useState } from "react";
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
import toast from "react-hot-toast";

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($updateProductInput: UpdateProductInput!) {
    updateProduct(updateProductInput: $updateProductInput)
  }
`;

const GET_AGREEMENTS = gql`
  query GetAgreements {
    AgreementList(pageable: { page: 1 }) {
      data {
        _id
        name
      }
    }
  }
`;

// subChapterId: null
// id: null
// measurementId: null

interface UpdateProductModalProps {
  productId: string;
  productData: {
    HSCode: string;
    nameEn: string;
    nameAr: string;
    defaultDutyRate: number;
    agreementId: string;
    serviceTax: boolean;
    adVAT: boolean;
  };
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  productId,
  productData,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState(productData);

  const { data: agreementsData } = useGenericQuery({
    query: GET_AGREEMENTS,
  });

  const { execute: updateProduct, isLoading } = useGenericMutation({
    mutation: UPDATE_PRODUCT,
    onSuccess: () => {
      toast.success("Product updated successfully! ✅");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating product: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProduct({
      updateProductInput: {
        ...formData,
        id: productId,
        defaultDutyRate: Number(formData.defaultDutyRate),
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, checked, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="HSCode">HS Code</Label>
            <Input
              id="HSCode"
              name="HSCode"
              value={formData.HSCode}
              onChange={handleInputChange}
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agreementId">Agreement</Label>
            <select
              id="agreementId"
              name="agreementId"
              value={formData.agreementId}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select an Agreement</option>
              {agreementsData?.AgreementList?.data.map(
                (agreement: { _id: string; name: string }) => (
                  <option key={agreement._id} value={agreement._id}>
                    {agreement.name}
                  </option>
                )
              )}
            </select>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductModal;
