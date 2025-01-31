"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { Eye } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import CreateAgreementModal from "@/components/Agreements/CreateAgreementModal";
import toast, { Toaster } from "react-hot-toast";

const GET_AGREEMENTS = gql`
  query GetAgreements($page: Int!) {
    AgreementList(pageable: { page: $page }) {
      data {
        _id
        name
        note
        reducedDutyRate
        createdAt
        updatedAt
        countryId {
          _id
          nameEn
          nameAr
          code
        }
        createdBy {
          _id
          firstName
          lastName
          email
        }
        updatedBy {
          _id
          firstName
          lastName
          email
        }
      }
      totalSize
      totalPages
      pageNumber
      pageSize
    }
  }
`;

const DELETE_AGREEMENT = gql`
  mutation DeleteAgreement($id: String!) {
    deleteAgreement(id: $id)
  }
`;

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Country = {
  _id: string;
  nameEn: string;
  nameAr: string;
  code: string;
};

type AgreementFromAPI = {
  _id: string;
  name: string;
  note: string;
  reducedDutyRate: number;
  createdAt: string;
  updatedAt: string;
  countryId: Country;
  createdBy: User;
  updatedBy: User;
  deletedBy?: User;
  deletedAt?: string;
};

// Extend the API type to include the required 'id' field for GenericTable
type Agreement = AgreementFromAPI & { id: string };

const Page = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_AGREEMENTS,
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

  const { execute: deleteAgreement } = useGenericMutation({
    mutation: DELETE_AGREEMENT,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error deleting agreement:", error);
      toast.error(`Error deleting agreement: ${error.message}`, {
        duration: 5000,
      });
    },
  });

  const handleDelete = (agreement: Agreement) => {
    deleteAgreement({ id: agreement._id });
  };

  // Transform the API data to include the required 'id' field
  const transformedData: Agreement[] = (data?.AgreementList?.data || []).map(
    (item: AgreementFromAPI) => ({
      ...item,
      id: item._id,
    })
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatUser = (user?: User) => {
    if (!user) return "N/A";
    return `${user.firstName} ${user.lastName}`;
  };

  const columns: {
    header: string;
    key: keyof Agreement;
    render?: (value: unknown, item: Agreement) => React.ReactNode;
  }[] = [
    {
      header: "Agreement Name",
      key: "name",
    },
    {
      header: "Country",
      key: "countryId",
      render: (_, item) => (
        <div>
          <div>{item.countryId.nameEn}</div>
          <div className="text-sm text-gray-500">{item.countryId.nameAr}</div>
          <div className="text-xs text-gray-400">
            Code: {item.countryId.code}
          </div>
        </div>
      ),
    },
    {
      header: "Reduced Duty Rate",
      key: "reducedDutyRate",
      render: (value) => `${value}%`,
    },
    {
      header: "Note",
      key: "note",
      render: (value) => `${value}` || "N/A",
    },
    {
      header: "Created By",
      key: "createdBy",
      render: (_, item) => (
        <div>
          <div>{formatUser(item.createdBy)}</div>
          <div className="text-xs text-gray-400">
            {formatDate(item.createdAt)}
          </div>
        </div>
      ),
    },
    {
      header: "Updated By",
      key: "updatedBy",
      render: (_, item) => (
        <div>
          <div>{formatUser(item.updatedBy)}</div>
          <div className="text-xs text-gray-400">
            {formatDate(item.updatedAt)}
          </div>
        </div>
      ),
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3 p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Trade Agreements
        </h1>
        <CreateAgreementModal onSuccess={refetch} />
      </div>
      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Agreements: ${data?.AgreementList?.totalSize || 0}`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.AgreementList?.pageNumber}
          totalPages={data?.AgreementList?.totalPages || 1}
          totalItems={data?.AgreementList?.totalSize || 0}
          pageSize={data?.AgreementList?.pageSize}
          onPageChange={handlePageChange}
        />
      )}
      <Toaster />
    </div>
  );
};

export default Page;
