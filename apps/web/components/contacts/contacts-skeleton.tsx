import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

export function ContactsSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <Table>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-[160px]" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-5 w-[80px] rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}