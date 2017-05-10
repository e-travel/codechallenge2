package ScalaGaleShapley

import scala.collection.mutable.HashMap
import scala.concurrent.Future
import scala.util.{Failure, Success}

import scala.concurrent._
import ExecutionContext.Implicits.global
import scala.concurrent.duration._

object GaleShapleyApp extends App {
  lazy val companies_file = args(0)
  lazy val professionals_file = args(1)
  lazy val out = args(2)

  val usage = """
    Usage: App companies.csv professionals.csv out.txt
  """

  if (args.length < 3) {
    println(usage)
    sys.exit(1)
  }

  val reader = new Reader(companies_file, professionals_file)

  def run = {
    var professionals : HashMap[String, Person] = HashMap[String, Person]()
    var companies : HashMap[String, Company] = HashMap[String, Company]()

    val f1 = Future {
      reader.readProfessionals()
    }

    val f2 = Future {
      reader.readCompanies()
    }

    professionals = Await.result(f1, 10000 second)
    companies = Await.result(f2, 10000 second)

    var algo = new GaleShapley(companies, professionals)
    algo.run

    // Write to external File
    import java.io._
    val pw = new PrintWriter(new File(out))
    for((_, c) <- companies){
      val line = c.id + ": " + c.matches.keySet.mkString(",") + "\n"
      pw.write(line)
    }
    pw.close
  }

  run

  def time[R](block: => R): R = {
    val t0 = System.currentTimeMillis()
    val result = block    // call-by-name
    val t1 = System.currentTimeMillis()
    println("Elapsed time: " + (t1 - t0) + "ms")
    result
  }

}
