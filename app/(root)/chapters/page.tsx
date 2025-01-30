"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { Eye } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import CreateChapterModal from "@/components/chapter/CreateChapterModal";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";

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
  mutation DeleteChapter($id: Int!) {
    deleteChapter(id: $id)
  }
`;

type Chapter = {
  _id: string;
  nameAr: string;
  nameEn: string;
};

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
      console.error("Error deleting chapter:", error);
    },
  });
  const handleDelete = (chapter: Chapter) => {
    deleteChapter({ id: chapter._id });
  };

  const columns: {
    header: string;
    key: keyof Chapter;
  }[] = [
    { header: "ID", key: "_id" },
    { header: "Arabic Name", key: "nameAr" },
    { header: "English Name", key: "nameEn" },
  ];

  const actions = [
    {
      label: "Delete Chapter",
      onClick: (item: { id: string | number }) =>
        handleDelete(item as unknown as Chapter),
      icon: <Eye className="w-4 h-4" />,
      className: "text-red-500",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  // console.log("data?.getChapters?", data?.getChapters);

  return (
    <div>
      <div className="flex justify-between items-center mb-3 p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Chapters
        </h1>
        <CreateChapterModal onSuccess={refetch} />
      </div>
      <GenericTable
        data={data?.getChapters?.data || []}
        columns={columns}
        actions={actions}
        subtitle={`Total Chapters: ${
          data?.getChapters?.totalElementsCount || 0
        }`}
        isLoading={loading}
        error={error}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.getChapters?.pageNumber}
          totalPages={data?.getChapters?.totalPagesCount || 1}
          totalItems={data?.getChapters?.totalElementsCount || 0}
          pageSize={data?.getChapters?.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;
