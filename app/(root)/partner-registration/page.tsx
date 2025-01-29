"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import React, { JSX, useState } from "react";
import { Eye } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { gql } from "@apollo/client/core";

type Action<T> = {
  label: string;
  onClick: (item: T) => void;
  icon?: JSX.Element;
  className?: string;
};
import { useRouter } from "next/navigation";

const GET_REGISTRATIONS = gql`
  query GetAllRegistrations($page: Int!) {
    getAllRegistrations(pageable: { page: $page }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        id: _id
        firstName
        lastName
        email
        companyName
        phone
        type
      }
    }
  }
`;

type Address = {
  address: string;
  zipCode: string;
};

type AddressResponse = {
  data?: Address[];
};

type Registration = {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  phone: string;
  type: string;
  trcSerial: string;
  trcIssuedAt: string;
  trcExpiresAt: string;
  crcSerial: string;
  crcIssuedAt: string;
  crcExpiresAt: string;
  isApproved: boolean;
  address?: AddressResponse; // Make address optional
};

type RegistrationsResponse = {
  getAllRegistrations: {
    totalSize: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
    data: Registration[];
  };
};

const formatType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const Page = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const { data, loading, error } = useGenericQuery<RegistrationsResponse>({
    query: GET_REGISTRATIONS,
    variables: {
      page: currentPage,
    },
    onError: (error) => {
      console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        graphQLErrors: error,
      });
    },
  });

  const handleView = (registration: Registration) => {
    router.push(`/partner-registration/${registration.id}`);
  };

  const columns: {
    header: string;
    key: keyof Registration;
    render?: (value: unknown, item: Registration) => JSX.Element;
  }[] = [
    // { header: "ID", key: "id" },
    {
      header: "Name",
      key: "firstName",
      render: (_, item: Registration) => (
        <span>{`${item.firstName} ${item.lastName}`}</span>
      ),
    },
    {
      header: "Type",
      key: "type",
      render: (value: unknown) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {formatType(value as string)}
        </span>
      ),
    },
    { header: "Phone", key: "phone" },
    { header: "Company", key: "companyName" },
    { header: "Email", key: "email" },

    {
      header: "Status",
      key: "isApproved",
      render: (value: unknown) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value ? "Approved" : "Pending"}
        </span>
      ),
    },
  ];

  const actions: Action<Registration>[] = [
    {
      label: "View",
      onClick: handleView,
      icon: <Eye className="w-4 h-4" />,
      className: "text-blue-600 hover:text-blue-800",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const registrations = data?.getAllRegistrations;

  return (
    <div className="w-[95%] mx-auto">
      <GenericTable
        data={registrations?.data || []}
        columns={columns}
        actions={actions}
        title="Partner Registration"
        subtitle={`Total Partners: ${registrations?.totalSize || 0}`}
        isLoading={loading}
        error={error}
      />
      {!loading && !error && registrations && (
        <Pagination
          currentPage={registrations.pageNumber}
          totalPages={registrations.totalPages}
          totalItems={registrations.totalSize}
          pageSize={registrations.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;
