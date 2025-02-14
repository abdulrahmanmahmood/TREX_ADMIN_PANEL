"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { EyeIcon, Pen, TrashIcon } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const GET_SCHEDULE_TAXES = gql`
  query FindAllScheduleTaxies($page: Int!) {
    findAllScheduleTaxies(pageable: { page: $page }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        note
        deletedAt
        createdAt
        updatedAt
        measurementId {
          _id
          unitNameAr
          unitNameEn
          note
          createdBy {
            _id
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

const DELETE_SCHEDULE_TAX = gql`
  mutation DeleteScheduleTax($id: ID!) {
    deleteScheduleTax(id: $id)
  }
`;

type ScheduleTaxFromAPI = {
  _id: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  measurementId: {
    _id: string;
    unitNameAr: string;
    unitNameEn: string;
    note: string;
    createdBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

// Extended type to include the required 'id' field and flattened properties for the table
type ScheduleTax = ScheduleTaxFromAPI & {
  id: string;
  unitNameAr: string;
  unitNameEn: string;
  createdByName: string;
};

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedTax, setSelectedTax] = useState<string | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const router = useRouter();

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_SCHEDULE_TAXES,
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

  const { execute: deleteScheduleTax } = useGenericMutation({
    mutation: DELETE_SCHEDULE_TAX,
    onSuccess: () => {
      refetch();
      toast.success("Schedule tax deleted successfully");
    },
    onError: (error) => {
      console.log("Error deleting schedule tax:", error);
      toast.error("Error deleting schedule tax");
    },
  });

  const handleDelete = (tax: ScheduleTax) => {
    deleteScheduleTax({ id: tax._id });
  };

  const handleEdit = (tax: ScheduleTax) => {
    setSelectedTax(tax.id);
    setOpenUpdateModal(true);
  };

  // Transform the API data to include flattened properties
  const transformedData: ScheduleTax[] = (
    data?.findAllScheduleTaxies?.data || []
  ).map((item: ScheduleTaxFromAPI) => ({
    ...item,
    id: item._id,
    unitNameAr: item.measurementId?.unitNameAr || "N/A",
    unitNameEn: item.measurementId?.unitNameEn || "N/A",
    createdByName: item.measurementId?.createdBy
      ? `${item.measurementId.createdBy.firstName} ${item.measurementId.createdBy.lastName}`
      : "N/A",
  }));

  const columns: {
    header: string;
    key: keyof ScheduleTax;
    render?: (value: unknown, item: ScheduleTax) => React.ReactNode;
  }[] = [
    {
      header: "Note",
      key: "note",
    },
    {
      header: "Unit Name (Arabic)",
      key: "unitNameAr",
      render: (value) => <span className="font-arabic">{value as string}</span>,
    },
    {
      header: "Unit Name (English)",
      key: "unitNameEn",
    },
    {
      header: "Created By",
      key: "createdByName",
    },
    {
      header: "Created At",
      key: "createdAt",
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: "Delete",
      onClick: handleDelete,
      icon: <TrashIcon className="w-4 h-4" />,
      className: "text-red-500",
    },
    {
      label: "Edit",
      onClick: handleEdit,
      icon: <Pen className="w-4 h-4" />,
      className: "text-blue-500",
    },
    {
      label: "View Details",
      onClick: (item: ScheduleTax) => {
        router.push(`schedule-taxes/${item.id}`);
      },
      icon: <EyeIcon className="w-4 h-4" />,
      className: "text-green-500",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3 px-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Schedule Taxes
        </h1>
      </div>
      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Schedule Taxes: ${
          data?.findAllScheduleTaxies?.totalSize || transformedData.length
        }`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && data?.findAllScheduleTaxies?.totalPages && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.findAllScheduleTaxies.totalPages || 1}
          totalItems={data.findAllScheduleTaxies.totalSize || 0}
          pageSize={data.findAllScheduleTaxies.pageSize || pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;
