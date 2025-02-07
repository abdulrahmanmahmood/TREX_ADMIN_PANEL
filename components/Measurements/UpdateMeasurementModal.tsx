"use client";
import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { toast } from "react-hot-toast";

// GraphQL Queries & Mutations
const GET_MEASUREMENT = gql`
  query GetMeasurement($id: String!) {
    measurement(id: $id) {
      _id
      unitName
      note
    }
  }
`;

const UPDATE_MEASUREMENT = gql`
  mutation UpdateMeasurement(
    $id: String!
    $updateMeasurementInput: UpdateMeasurementDTO!
  ) {
    updateMeasurement(id: $id, updateMeasurementInput: $updateMeasurementInput)
  }
`;

const UpdateMeasurementModal = ({ measurementId, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({ unitName: "", note: "" });

  const { data, loading } = useGenericQuery({
    query: GET_MEASUREMENT,
    variables: { id: measurementId },
    skip: !measurementId,
    onCompleted: (data) => {
      if (data?.measurement) {
        setFormData({
          unitName: data.measurement.unitName || "",
          note: data.measurement.note || "",
        });
      }
    },
  });

  const { execute: updateMeasurement, isLoading } = useGenericMutation({
    mutation: UPDATE_MEASUREMENT,
    onSuccess: () => {
      toast.success("Measurement updated successfully!");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating measurement: ${error.message}`);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMeasurement({
      variables: {
        id: measurementId,
        updateMeasurementInput: formData,
      },
    });
  };

  return (
    <Dialog open={!!measurementId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitName">Unit Name</Label>
            <Input
              id="unitName"
              name="unitName"
              value={formData.unitName}
              onChange={handleInputChange}
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
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || loading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMeasurementModal;
