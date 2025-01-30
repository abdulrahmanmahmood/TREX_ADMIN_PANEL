"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React from "react";
import { Eye } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";

const GET_COUNTRIES = gql`
  query GetCountries {
    countryList {
      _id
      nameEn
      nameAr
      code
    }
  }
`;

const DELETE_COUNTRY = gql`
  mutation DeleteCountry($id: String!) {
    deleteCountry(id: $id)
  }
`;

type CountryFromAPI = {
  _id: string;
  nameEn: string;
  nameAr: string;
  code: string;
};

// Extend the API type to include the required 'id' field for GenericTable
type Country = CountryFromAPI & { id: string };

const Page = () => {
  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_COUNTRIES,
    onError: (error) => {
      console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        graphQLErrors: error,
      });
    },
  });

  const { execute: deleteCountry } = useGenericMutation({
    mutation: DELETE_COUNTRY,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting country:", error);
    },
  });

  const handleDelete = (country: Country) => {
    deleteCountry({ id: country._id });
  };

  // Transform the API data to include the required 'id' field
  const transformedData: Country[] = (data?.countryList || []).map(
    (item: CountryFromAPI) => ({
      ...item,
      id: item._id,
    })
  );

  const columns: {
    header: string;
    key: keyof Country;
    render?: (value: unknown, item: Country) => React.ReactNode;
  }[] = [
    {
      header: "Country Code",
      key: "code",
      render: (value) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{`${value}`}</span>
      ),
    },
    {
      header: "English Name",
      key: "nameEn",
    },
    {
      header: "Arabic Name",
      key: "nameAr",
      render: (value) => <span className="font-arabic">{`${value}`}</span>,
    },
  ];

  const actions = [
    {
      label: "Delete",
      onClick: handleDelete,
      icon: <Eye className="w-4 h-4" />,
      className: "text-red-500",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-3 p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Countries
        </h1>
        {/* Add CreateCountryModal component here */}
      </div>
      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Countries: ${transformedData.length}`}
        isLoading={loading}
        error={error || null}
      />
    </div>
  );
};

export default Page;
