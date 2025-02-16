import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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
import Select, { StylesConfig } from "react-select";
import { selectStyles } from "./CreateProductModal";

// Types
interface Chapter {
  _id: string;
  nameEn: string;
  subChapters: SubChapter[];
}

interface SubChapter {
  _id: string;
  nameEn: string;
}
export interface AgreementFormData {
  agreementId: string;
  reducedDutyRate: number;
  applyGlobal: boolean;
}

interface Agreement {
  _id: string;
  name: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface ProductData {
  HSCode?: string;
  nameEn: string;
  nameAr: string;
  defaultDutyRate: number;
  subChapterId: string;
  agreements: AgreementFormData[]; // Changed from agreementId
  serviceTax: boolean;
  adVAT: number; // Changed from boolean
  type: "regural" | "car"; // Added type field
}

interface UpdateProductModalProps {
  productId: string;
  productData: ProductData;
  onSuccess?: () => void;
  onClose: () => void;
}

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($updateProductInput: UpdateProductInput!) {
    updateProduct(updateProductInput: $updateProductInput)
  }
`;

const GET_AGREEMENTS = gql`
  query GetAgreements {
    AgreementList(filter: { deleted: false }, pageable: { page: 1 }) {
      data {
        _id
        name
      }
    }
  }
`;

const GET_CHAPTERS = gql`
  query GetChapters {
    getChapters(extraFilter: { deleted: false }, pageable: { page: 1 }) {
      data {
        _id
        nameEn
        subChapters {
          _id
          nameEn
        }
      }
    }
  }
`;

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  productId,
  productData,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState(productData);
  const [changedFields, setChangedFields] = useState<Partial<ProductData>>({});
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");

  const { data: agreementsData } = useGenericQuery({ query: GET_AGREEMENTS });
  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });

  useEffect(() => {
    if (chaptersData?.getChapters?.data && formData.subChapterId) {
      let found = false;
      chaptersData.getChapters.data.forEach((chapter: Chapter) => {
        if (chapter._id === formData.subChapterId) {
          setSelectedName(chapter.nameEn);
          found = true;
        } else {
          chapter.subChapters?.forEach((subChapter: SubChapter) => {
            if (subChapter._id === formData.subChapterId) {
              setSelectedName(subChapter.nameEn);
              found = true;
            }
          });
        }
      });
      if (!found) setSelectedName("Select a Chapter");
    }
  }, [chaptersData, formData.subChapterId]);

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

  const updateChangedFields = (name: keyof ProductData, value: any) => {
    if (value !== productData[name]) {
      setChangedFields((prev) => ({ ...prev, [name]: value }));
    } else {
      const { [name]: removed, ...rest } = changedFields;
      setChangedFields(rest);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(changedFields).length === 0) {
      toast("No changes detected");
      return;
    }

    const updateData = {
      id: productId,
      ...changedFields,
    };

    if ("defaultDutyRate" in changedFields) {
      updateData.defaultDutyRate = Number(changedFields.defaultDutyRate);
    }
    if ("adVAT" in changedFields) {
      updateData.adVAT = Number(changedFields.adVAT);
    }
    if ("agreements" in changedFields) {
      updateData.agreements = changedFields.agreements;
    }

    updateProduct({
      updateProductInput: updateData,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, checked, value } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    updateChangedFields(name as keyof ProductData, newValue);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: chapter._id,
    }));
    updateChangedFields("subChapterId", chapter._id);
    setSelectedName(chapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  const handleSubChapterSelect = (subChapter: SubChapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: subChapter._id,
    }));
    updateChangedFields("subChapterId", subChapter._id);
    setSelectedName(subChapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  const handleAgreementChange = (selected: readonly SelectOption[]) => {
    const newAgreements = selected.map((option) => {
      const existingAgreement = formData.agreements.find(
        (a) => a.agreementId === option.value
      );
      return (
        existingAgreement || {
          agreementId: option.value,
          reducedDutyRate: 0,
          applyGlobal: true,
        }
      );
    });

    setFormData((prev) => ({
      ...prev,
      agreements: newAgreements,
    }));
    updateChangedFields("agreements", newAgreements);
  };

  const handleAgreementDutyRateChange = (agreementId: string, rate: number) => {
    const newAgreements = formData.agreements.map((agreement) =>
      agreement.agreementId === agreementId
        ? { ...agreement, reducedDutyRate: rate }
        : agreement
    );

    setFormData((prev) => ({
      ...prev,
      agreements: newAgreements,
    }));
    updateChangedFields("agreements", newAgreements);
  };

  const handleAgreementGlobalChange = (
    agreementId: string,
    applyGlobal: boolean
  ) => {
    const newAgreements = formData.agreements.map((agreement) =>
      agreement.agreementId === agreementId
        ? { ...agreement, applyGlobal }
        : agreement
    );

    setFormData((prev) => ({
      ...prev,
      agreements: newAgreements,
    }));
    updateChangedFields("agreements", newAgreements);
  };

  // Transform agreements data for react-select
  const agreementOptions: SelectOption[] =
    agreementsData?.AgreementList?.data.map((agreement: Agreement) => ({
      value: agreement._id,
      label: agreement.name,
    })) || [];

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
            <Label>Chapter</Label>
            <div className="relative">
              <div
                className="w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white"
                onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
              >
                <span>{selectedName}</span>
                <ChevronDown className="w-4 h-4" />
              </div>

              {isChapterDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {chaptersData?.getChapters?.data.map((chapter: Chapter) => (
                    <div key={chapter._id} className="border-b last:border-b-0">
                      <div
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          if (expandedChapter === chapter._id) {
                            handleChapterSelect(chapter);
                          } else {
                            setExpandedChapter(chapter._id);
                          }
                        }}
                      >
                        {chapter.subChapters?.length > 0 && (
                          <span className="mr-2">
                            {expandedChapter === chapter._id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                        )}
                        <span className="font-medium">{chapter.nameEn}</span>
                      </div>

                      {expandedChapter === chapter._id &&
                        chapter.subChapters?.map((subChapter) => (
                          <div
                            key={subChapter._id}
                            className="pl-8 pr-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-t"
                            onClick={() => handleSubChapterSelect(subChapter)}
                          >
                            {subChapter.nameEn}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Agreements</Label>
            <Select<SelectOption, true>
              isMulti
              options={agreementOptions}
              styles={selectStyles}
              className="w-full"
              onChange={handleAgreementChange}
              value={agreementOptions.filter((option) =>
                formData.agreements.some(
                  (agreement) => agreement.agreementId === option.value
                )
              )}
            />

            {formData.agreements.length > 0 && (
              <div className="mt-4 space-y-4">
                {formData.agreements.map((agreement) => {
                  const agreementName = agreementOptions.find(
                    (opt) => opt.value === agreement.agreementId
                  )?.label;

                  return (
                    <div
                      key={agreement.agreementId}
                      className="space-y-2 p-4 border rounded-md"
                    >
                      <div className="font-medium">{agreementName}</div>

                      <div className="space-y-2">
                        <Label htmlFor={`dutyRate-${agreement.agreementId}`}>
                          Reduced Duty Rate (%)
                        </Label>
                        <Input
                          id={`dutyRate-${agreement.agreementId}`}
                          type="number"
                          value={agreement.reducedDutyRate}
                          onChange={(e) =>
                            handleAgreementDutyRateChange(
                              agreement.agreementId,
                              Number(e.target.value)
                            )
                          }
                          min="0"
                          max="100"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`global-${agreement.agreementId}`}
                          checked={agreement.applyGlobal}
                          onChange={(e) =>
                            handleAgreementGlobalChange(
                              agreement.agreementId,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`global-${agreement.agreementId}`}>
                          Apply Globally
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="regural">Regular</option>
              <option value="car">Car</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || Object.keys(changedFields).length === 0}
          >
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductModal;
