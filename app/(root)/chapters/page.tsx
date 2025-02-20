"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { Eye } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import CreateChapterModal from "@/components/chapter/CreateChapterModal";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import toast from "react-hot-toast";

const GET_CHAPTERS = gql`
  query GetChapters($page: Int!) {
    getChapters(pageable: { page: $page }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        nameAr
        nameEn
      }
    }
  }
`;

const DELETE_CHAPTER = gql`
  mutation DeleteChapter($id: ID!) {
    deleteChapter(id: $id)
  }
`;

type ChapterFromAPI = {
  _id: string;
  nameAr: string;
  nameEn: string;
};

// Extended type to include the required 'id' field for GenericTable
type Chapter = ChapterFromAPI & { id: string };

const Page = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_CHAPTERS,
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

  const { execute: deleteChapter } = useGenericMutation({
    mutation: DELETE_CHAPTER,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error deleting chapter:", error);
      toast.error(`Error deleting chapter: `);
    },
  });

  const handleDelete = (chapter: Chapter) => {
    deleteChapter({ id: chapter._id });
  };

  // Transform the API data to include the required 'id' field
  const transformedData: Chapter[] = (data?.getChapters?.data || []).map(
    (item: ChapterFromAPI) => ({
      ...item,
      id: item._id, // Add the required 'id' field
    })
  );

  const columns: {
    header: string;
    key: keyof Chapter;
    render?: (value: unknown, item: Chapter) => React.ReactNode;
  }[] = [
    {
      header: "Arabic Name",
      key: "nameAr",
      render: (value) => <span className="font-arabic">{`${value}`}</span>,
    },
    {
      header: "English Name",
      key: "nameEn",
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
          Chapters
        </h1>
        <CreateChapterModal onSuccess={refetch} />
      </div>
      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Chapters: ${
          data?.getChapters?.totalSize || transformedData.length
        }`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && data?.getChapters?.totalPages && (
        <Pagination
          currentPage={data.getChapters.pageNumber || 0}
          totalPages={data.getChapters.totalPages || 1}
          totalItems={data.getChapters.totalSize || 0}
          pageSize={data.getChapters.pageSize || pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;
