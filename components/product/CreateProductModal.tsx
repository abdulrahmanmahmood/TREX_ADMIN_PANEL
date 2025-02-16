import React, { useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { gql } from "@apollo/client";
import Select, { StylesConfig } from "react-select";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast/headless";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/dialog";
import { Button } from "../UI/button";
import { Label } from "../UI/label";
import { Input } from "../UI/input";

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
interface Agreement {
  _id: string;
  name: string;
}
interface AgreementFormData {
  agreementId: string;
  reducedDutyRate: number;
  applyGlobal: boolean;
}
interface SelectOption {
  value: string;
  label: string;
}

interface FormData {
  HSCode?: string;
  nameEn: string;
  nameAr: string;
  defaultDutyRate: number;
  subChapterId: string;
  agreements: AgreementFormData[];
  serviceTax: boolean;
  adVAT: number;
  type: "regural" | "car";
}

// GraphQL Queries
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

const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput)
  }
`;

export const selectStyles: StylesConfig<SelectOption, true> = {
  control: (base) => ({
    ...base,
    backgroundColor: "white",
    borderColor: "#e2e8f0",
    "&:hover": {
      borderColor: "#cbd5e1",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "white",
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0f172a"
      : state.isFocused
      ? "#f1f5f9"
      : "white",
    "&:active": {
      backgroundColor: "#e2e8f0",
    },
  }),
};

interface CreateProductModalProps {
  onSuccess?: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("Select a Chapter");
  const [formData, setFormData] = useState<FormData>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    defaultDutyRate: 0,
    subChapterId: "",
    agreements: [],
    serviceTax: false,
    adVAT: 0,
    type: "regural",
  });

  const { data: chaptersData } = useGenericQuery({ query: GET_CHAPTERS });
  const { data: agreementsData } = useGenericQuery({ query: GET_AGREEMENTS });

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
        agreements: [],
        serviceTax: false,
        adVAT: 0,
        type: "regural",
      });
      setSelectedName("Select a Chapter");
      toast.success("Product created successfully! ✅");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error creating product: ${error.message}`);
    },
  });
  const handleAgreementChange = (selected: readonly SelectOption[]) => {
    const newAgreements = selected.map((option) => ({
      agreementId: option.value,
      reducedDutyRate: 0,
      applyGlobal: true,
    }));
    setFormData((prev) => ({
      ...prev,
      agreements: newAgreements,
    }));
  };

  const handleAgreementDutyRateChange = (agreementId: string, rate: number) => {
    setFormData((prev) => ({
      ...prev,
      agreements: prev.agreements.map((agreement) =>
        agreement.agreementId === agreementId
          ? { ...agreement, reducedDutyRate: rate }
          : agreement
      ),
    }));
  };

  const handleAgreementGlobalChange = (
    agreementId: string,
    applyGlobal: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      agreements: prev.agreements.map((agreement) =>
        agreement.agreementId === agreementId
          ? { ...agreement, applyGlobal }
          : agreement
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      defaultDutyRate: Number(formData.defaultDutyRate),
      adVAT: Number(formData.adVAT),
      agreements: formData.agreements
        .map((agreement) => JSON.stringify(agreement))
        .join(","),
    };

    if (!submitData.HSCode) {
      delete submitData.HSCode;
    }

    createProduct({
      createProductInput: submitData,
    });
  };

  // Transform agreements data for react-select
  const agreementOptions: SelectOption[] =
    agreementsData?.AgreementList?.data.map((agreement: Agreement) => ({
      value: agreement._id,
      label: agreement.name,
    })) || [];
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? value === "on" : value,
    }));
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: chapter._id,
    }));
    setSelectedName(chapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  const handleSubChapterSelect = (subChapter: SubChapter) => {
    setFormData((prev) => ({
      ...prev,
      subChapterId: subChapter._id,
    }));
    setSelectedName(subChapter.nameEn);
    setIsChapterDropdownOpen(false);
  };

  // Transform agreements data for react-select

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] py-5">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="HSCode">HS Code (Optional)</Label>
            <Input
              id="HSCode"
              name="HSCode"
              value={formData.HSCode}
              onChange={handleInputChange}
            />
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

          {/* Chapter Dropdown */}
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

          {/* Agreements Multi-Select */}
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

            {/* Agreement Duty Rates */}
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
            <Label htmlFor="adVAT">VAT Rate (%)</Label>
            <Input
              id="adVAT"
              name="adVAT"
              type="number"
              value={formData.adVAT}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
              required
            />
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
