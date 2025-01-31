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
import toast from "react-hot-toast";

const CREATE_AGREEMENT = gql`
  mutation CreateAgreement($createAgreementDTO: CreateAgreementDTO!) {
    createAgreement(createAgreementDTO: $createAgreementDTO)
  }
`;

interface CreateAgreementModalProps {
  onSuccess?: () => void;
}

const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    reducedDutyRate: 0,
    countryId: "",
    note: "",
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
      onSuccess?.();
    },
    onError: (error) => {
      console.log("Error creating agreement:", error);
      toast.error(`Error creating agreement: ${error.cause}`, {
        position: "top-right",
        duration: 3000,
      });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
              className="w-full"
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
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryId">Country ID</Label>
            <Input
              id="countryId"
              name="countryId"
              value={formData.countryId}
              onChange={handleInputChange}
              placeholder="Enter country ID"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Enter note"
              className="w-full"
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
