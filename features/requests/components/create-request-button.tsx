"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Fragment, useState } from "react";
import { RequestForm } from "../form";

export function CreateRequestButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Fragment>
      <Button
        className="w-full md:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tạo yêu cầu mới
      </Button>

      <RequestForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </Fragment>
  );
}
