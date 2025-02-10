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
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";

const CREATE_AGREEMENT = gql`
  mutation CreateAgreement($createAgreementDTO: CreateAgreementDTO!) {
    createAgreement(createAgreementDTO: $createAgreementDTO)
  }
`;

const GET_COUNTRIES = gql`
  query CountryList($page: Int!) {
    countryList(pageable: { page: $page }) {
      data {
        _id
        nameEn
      }
    }
  }
`;

interface CreateAgreementModalProps {
  onSuccess?: () => void;
}

const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    reducedDutyRate: 0,
    countryId: "",
    note: "",
  });

  // Fetch countries
  const { data: countriesData, loading: loadingCountries } = useGenericQuery({
    query: GET_COUNTRIES,
    variables: { page: currentPage },
  });

  const { execute: createAgreement, isLoading } = useGenericMutation({
    mutation: CREATE_AGREEMENT,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        name: "",
        reducedDutyRate: 0,
        countryId: "",
        note: "",
      });
      toast.success("Agreement created successfully! ✅");
      onSuccess?.();
    },
    onError: (error) => {
      console.log("Error creating agreement:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createAgreement({
      createAgreementDTO: {
        ...formData,
        reducedDutyRate: Number(formData.reducedDutyRate),
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Agreement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reducedDutyRate">Reduced Duty Rate</Label>
            <Input
              id="reducedDutyRate"
              name="reducedDutyRate"
              type="number"
              value={formData.reducedDutyRate}
              onChange={handleInputChange}
              placeholder="Enter reduced duty rate"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryId">Select Country</Label>
            <div className="relative flex items-center gap-3">
              <select
                id="countryId"
                name="countryId"
                value={formData.countryId}
                onChange={handleInputChange}
                className="flex-1 h-10 w-full rounded-l-md border border-r-0 border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loadingCountries}
              >
                <option value="" disabled>
                  {loadingCountries
                    ? "Loading countries..."
                    : "Select a country"}
                </option>
                {countriesData?.countryList?.data.map(
                  (country: { _id: string; nameEn: string }) => (
                    <option key={country._id} value={country._id}>
                      {country.nameEn}
                    </option>
                  )
                )}
              </select>
              <div className="flex flex-col border border-l-0 border-input rounded-r-md bg-background">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loadingCountries}
                  className="flex items-center justify-center h-5 px-2 border-b border-input hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-tr-md"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={
                    !countriesData?.countryList?.data?.length ||
                    loadingCountries
                  }
                  className="flex items-center justify-center h-5 px-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-br-md"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Enter note"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Agreement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgreementModal;
