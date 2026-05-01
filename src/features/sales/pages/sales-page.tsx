import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { QuotesTab } from "../components/quotes-tab";
import { ContractsTab } from "../components/contracts-tab";
import { OrdersTab } from "../components/orders-tab";

export function SalesPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader
        title="Ventas"
        description="Gestión de cotizaciones, contratos y pedidos"
      />
      <div className="p-6">
        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="quotes">Cotizaciones</TabsTrigger>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>
          <TabsContent value="quotes" className="mt-6">
            <QuotesTab />
          </TabsContent>
          <TabsContent value="contracts" className="mt-6">
            <ContractsTab />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
