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
  const [formData, setFormData] = useState({
    name: "",
    reducedDutyRate: 0,
    countryId: "",
    note: "",
  });

  // Fetch countries
  const { data: countriesData, loading: loadingCountries } = useGenericQuery({
    query: GET_COUNTRIES,
    variables: { page: 1 },
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
            <select
              id="countryId"
              name="countryId"
              value={formData.countryId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              required
              disabled={loadingCountries}
            >
              <option value="" disabled>
                {loadingCountries ? "Loading countries..." : "Select a country"}
              </option>
              {countriesData?.countryList?.data.map(
                (country: { _id: string; nameEn: string }) => (
                  <option key={country._id} value={country._id}>
                    {country.nameEn}
                  </option>
                )
              )}
            </select>
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

// import React, { useState } from "react";
// import { Button } from "@/components/UI/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/UI/dialog";
// import { Input } from "@/components/UI/input";
// import { Label } from "@/components/UI/label";
// import { Plus } from "lucide-react";
// import { gql } from "@apollo/client";
// import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
// import toast from "react-hot-toast";

// const CREATE_AGREEMENT = gql`
//   mutation CreateAgreement($createAgreementDTO: CreateAgreementDTO!) {
//     createAgreement(createAgreementDTO: $createAgreementDTO)
//   }
// `;

// interface CreateAgreementModalProps {
//   onSuccess?: () => void;
// }

// const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({
//   onSuccess,
// }) => {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     reducedDutyRate: 0,
//     countryId: "",
//     note: "",
//   });

//   const { execute: createAgreement, isLoading } = useGenericMutation({
//     mutation: CREATE_AGREEMENT,
//     onSuccess: () => {
//       setOpen(false);
//       setFormData({
//         name: "",
//         reducedDutyRate: 0,
//         countryId: "",
//         note: "",
//       });
//       toast.success("Agreement created successfully! ✅");
//       onSuccess?.();
//     },
//     onError: (error) => {
//       console.log("Error creating agreement:", error);
//       toast.error(`${error.message}`, {
//         position: "top-right",
//         duration: 3000,
//       });
//     },
//   });

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     createAgreement({
//       createAgreementDTO: {
//         ...formData,
//         reducedDutyRate: Number(formData.reducedDutyRate),
//       },
//     });
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="mb-4">
//           <Plus className="w-4 h-4 mr-2" />
//           Add New Agreement
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create New Agreement</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               placeholder="Enter name"
//               className="w-full"
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="reducedDutyRate">Reduced Duty Rate</Label>
//             <Input
//               id="reducedDutyRate"
//               name="reducedDutyRate"
//               type="number"
//               value={formData.reducedDutyRate}
//               onChange={handleInputChange}
//               placeholder="Enter reduced duty rate"
//               className="w-full"
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="countryId">Country ID</Label>
//             <Input
//               id="countryId"
//               name="countryId"
//               value={formData.countryId}
//               onChange={handleInputChange}
//               placeholder="Enter country ID"
//               className="w-full"
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="note">Note</Label>
//             <Input
//               id="note"
//               name="note"
//               value={formData.note}
//               onChange={handleInputChange}
//               placeholder="Enter note"
//               className="w-full"
//               required
//             />
//           </div>
//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Creating..." : "Create Agreement"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreateAgreementModal;
