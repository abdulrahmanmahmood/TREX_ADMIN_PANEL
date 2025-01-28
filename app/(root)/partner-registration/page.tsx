"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import React, { JSX, useState } from "react";
import { Eye } from "lucide-react"; // Import icons for actions
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/navigation";

const GET_REGISTRATIONS = gql`
  query GetRegistrations($page: Int!, $size: Int!) {
    getRegistrations(pageable: { page: $page, size: $size }) {
      pageNumber
      totalPagesCount
      totalElementsCount
      pageElementsCount
      pageSize
      firstPage
      lastPage
      emptyPage
      registrations {
        id
        type
        phoneNumber
        address
        name
      }
    }
  }
`;
type Registration = {
  id: string;
  type: string;
  phoneNumber: string;
  address: string;
  name: string;
};

const formatType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const Page = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const router = useRouter();
  const { data, loading, error } = useGenericQuery({
    query: GET_REGISTRATIONS,
    variables: {
      page: currentPage,
      size: pageSize,
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
    { header: "ID", key: "id" },
    { header: "Name", key: "name" },
    {
      header: "Type",
      key: "type",
      render: (value: unknown) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {formatType(value as string)}
        </span>
      ),
    },
    { header: "Phone", key: "phoneNumber" },
    { header: "Address", key: "address" },
  ];

  const actions = [
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

  return (
    <div>
      <GenericTable
        data={data?.getRegistrations?.registrations || []}
        columns={columns}
        actions={actions}
        title="Partner Registration"
        subtitle={`Total Partners: ${
          data?.getRegistrations?.totalElementsCount || 0
        }`}
        isLoading={loading}
        error={error}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.getRegistrations?.pageNumber}
          totalPages={data?.getRegistrations?.totalPagesCount || 1}
          totalItems={data?.getRegistrations?.totalElementsCount || 0}
          pageSize={data?.getRegistrations?.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;
