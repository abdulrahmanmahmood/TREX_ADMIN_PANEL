"use client";
import React, { use, useState } from "react";
import { gql } from "@apollo/client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/UI/badge";
import GenericTable from "@/components/UI/Table/GenericTable";
import CreateSubChapterModal from "@/components/chapter/CreateSubChapterModal";
import UpdateChapterModal from "@/components/chapter/UpdateChapterModal";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import toast from "react-hot-toast";

// Types remain the same...
interface SubChapter {
  _id: string;
  nameEn: string;
  nameAr: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
type TransformedSubChapter = SubChapter & { id: string };

interface ChapterDetail {
  _id: string;
  nameEn: string;
  nameAr: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  _id: string;
  nameEn: string;
  nameAr: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  chapterId: ChapterDetail;
  subChapters: SubChapter[];
}

interface ChapterResponse {
  chapter: Chapter;
}

const CHAPTER_QUERY = gql`
  query Chapter($id: ID!) {
    chapter(id: $id) {
      _id
      nameEn
      nameAr
      deletedAt
      createdAt
      updatedAt
      chapterId {
        _id
        nameEn
        nameAr
        deletedAt
        createdAt
        updatedAt
      }
      subChapters {
        _id
        nameEn
        nameAr
        deletedAt
        createdAt
        updatedAt
      }
    }
  }
`;
const DELETE_CHAPTER = gql`
  mutation DeleteChapter($id: ID!) {
    deleteChapter(id: $id)
  }
`;

export default function ChapterPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedSubChapter, setSelectedSubChapter] =
    useState<SubChapter | null>(null);

  const { data, loading, error, refetch } = useGenericQuery<ChapterResponse>({
    query: CHAPTER_QUERY,
    variables: { id },
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

  const handleDelete = (subChapter: TransformedSubChapter) => {
    deleteChapter({ id: subChapter._id });
  };
  const handleEdit = (subChapter: TransformedSubChapter) => {
    setSelectedSubChapter(subChapter);
  };

  // Table configuration for subchapters
  const columns: {
    header: string;
    key: keyof TransformedSubChapter;
    render?: (value: unknown, item: TransformedSubChapter) => React.ReactNode;
  }[] = [
    {
      header: "English Name",
      key: "nameEn",
    },
    {
      header: "Arabic Name",
      key: "nameAr",
    },
    {
      header: "Created At",
      key: "createdAt",
      render: (value) => <span className="font-arabic">{`${value}`}</span>,
    },
    {
      header: "Updated At",
      key: "updatedAt",
      render: (value) => <span className="font-arabic">{`${value}`}</span>,
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: handleEdit,
      icon: <Pencil className="h-4 w-4" />,
      className: "text-blue-600 hover:text-blue-800",
    },
    {
      label: "Delete",
      onClick: handleDelete,
      icon: <Trash2 className="h-4 w-4" />,
      className: "text-red-600 hover:text-red-800",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data?.chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No chapter found</div>
      </div>
    );
  }

  const { chapter } = data;

  // Transform subchapters data to include id for GenericTable
  const subChaptersData: TransformedSubChapter[] = chapter.subChapters.map(
    (subChapter) => ({
      ...subChapter,
      id: subChapter._id, // GenericTable expects an id field
    })
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Chapter Details Card */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Chapter Details
            </CardTitle>
            <Badge variant="secondary">ID: {chapter._id}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className=" gap-6">
            {/* Parent Chapter Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Parent Chapter</h3>
              <Badge className="mb-2">ID: {chapter._id}</Badge>
              <p>
                <span className="font-medium">English Name:</span>{" "}
                {chapter.nameEn}
              </p>
              <p>
                <span className="font-medium">Arabic Name:</span>{" "}
                {chapter.nameAr}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <CreateSubChapterModal
        chapterId={chapter._id}
        onSuccess={() => {
          // Refetch the chapter data to update the table
          refetch();
        }}
      />
      {selectedSubChapter && (
        <UpdateChapterModal
          chapterId={selectedSubChapter._id}
          onSuccess={() => {
            setSelectedSubChapter(null);
            refetch();
          }}
          onClose={() => setSelectedSubChapter(null)}
        />
      )}
      {/* Subchapters Table */}
      <GenericTable
        data={subChaptersData}
        columns={columns}
        actions={actions}
        title="Sub Chapters"
        subtitle={`Showing ${subChaptersData.length} sub chapters`}
        isLoading={loading}
        error={error}
      />
    </div>
  );
}
