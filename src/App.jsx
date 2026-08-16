import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Centro de Tutorías Académicas</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Sistema de gestión de citas para estudiantes y tutores.
          </p>

          <Button>Comenzar</Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default App