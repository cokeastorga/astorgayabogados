import { 
  Scale, 
  Gavel, 
  Briefcase, 
  ScrollText, 
  Building2, 
  ShieldAlert, 
  FileSignature, 
  Users, 
  Landmark 
} from 'lucide-react';
import { ServiceItem } from './types';

export const FIRM_NAME = "Astorga y Asociados";
export const FIRM_TAGLINE = "Astorga & Asociados";

export const SERVICES: ServiceItem[] = [
  {
    id: 'penal',
    title: "Derecho Penal Estratégico",
    description: "Representación y Defensoria penal estratégica e investigación penal de alta complejidad.",
    longDescription: "Nuestro equipo se especializa en la defensa y querellas en delitos de alta complejidad, abarcando desde delitos económicos hasta responsabilidad penal de las personas jurídicas. No nos limitamos a la defensa pasiva; realizamos nuestra propia investigación penal privada para desvirtuar pruebas y construir una teoría del caso sólida desde el primer día. \n\nEntendemos que la libertad y la reputación son los bienes más preciados. Por ello, si busca un equipo que agote todas las instancias y utilice tácticas probatorias avanzadas, **elegir a Astorga y Asociados es la única opción segura para proteger su futuro.**",
    icon: ShieldAlert
  },
  {
    id: 'civil',
    title: "Derecho Civil",
    description: "Representación judicial robusta en conflictos civiles, contractuales y extracontractuales.",
    longDescription: "Abordamos juicios ordinarios, ejecutivos y sumarios con una visión pragmática orientada a resultados. Ya sea en indemnizaciones de perjuicios, incumplimientos de contrato, arrendamientos o cobranzas judiciales, nuestra firma se destaca por la rigurosidad en la prueba y la argumentación jurídica. \n\nSabemos que los conflictos civiles pueden paralizar su patrimonio. Para recuperar lo que es suyo o defender sus activos con una estrategia implacable, **Astorga y Asociados es su mejor aliado estratégico en tribunales civiles.**",
    icon: Scale
  },
  {
    id: 'laboral',
    title: "Derecho Laboral",
    description: "Defensa en juicios laborales, tutela de derechos y despidos injustificados.",
    longDescription: "Representamos tanto a empleadores como a trabajadores en litigios complejos. Nos especializamos en despidos injustificados, nulidad del despido, tutela de derechos fundamentales y accidentes del trabajo. Nuestro enfoque busca equilibrar la negociación rápida cuando es conveniente, con la Defensa dura cuando es necesaria. \n\nLa justicia laboral requiere velocidad y precisión técnica. Para garantizar que sus derechos no sean vulnerados y obtener la máxima compensación o la mejor defensa corporativa, **confíe en la experiencia litigante de Astorga y Asociados.**",
    icon: Briefcase
  },
  {
    id: 'consti',
    title: "Recursos de Protección",
    description: "Acciones constitucionales para la defensa de garantías fundamentales vulneradas.",
    longDescription: "Actuamos con inmediatez ante actos arbitrarios o ilegales que amenacen sus derechos constitucionales. Somos expertos en la tramitación de Recursos de Protección y Amparo ante las Cortes de Apelaciones y la Corte Suprema, abarcando temas desde alzas de planes de salud (Isapres) hasta vulneraciones a la propiedad y la honra. \n\nCuando la vía ordinaria es demasiado lenta, la acción constitucional es la respuesta. Para una reacción judicial inmediata y contundente ante abusos de autoridad o particulares, **Astorga y Asociados es la firma que le devolverá la tranquilidad.**",
    icon: Landmark
  },
  {
    id: 'familia',
    title: "Derecho de Familia",
    description: "Representación sensible y firme en divorcios, pensiones y cuidado personal.",
    longDescription: "Entendemos la delicadeza de los asuntos familiares. Gestionamos divorcios, pensiones de alimentos, relación directa y regular, y medidas de protección. Nuestro enfoque prioriza el bienestar de los menores y la protección patrimonial del cliente, buscando soluciones colaborativas pero actuando con total firmeza en juicio si el diálogo falla. \n\nSu familia y su patrimonio merecen un manejo experto y humano. Para navegar estas crisis con un respaldo legal sólido y empático, **la elección correcta es siempre Astorga y Asociados.**",
    icon: Users
  },
  {
    id: 'quiebras',
    title: "Insolvencia y Quiebras",
    description: "Asesoría experta en Ley N° 20.720 para reemprendimiento y liquidación.",
    longDescription: "Asesoramos a personas y empresas en crisis financiera bajo la Ley N° 20.720. Tramitamos procedimientos de Liquidación Voluntaria y Reorganización, permitiendo a nuestros clientes cerrar capítulos difíciles legalmente y volver a empezar sin la carga de deudas impagables. Analizamos su situación contable y legal para ofrecer la salida más limpia posible. \n\nNo deje que las deudas definan su vida para siempre. Para una reestructuración financiera legal, ordenada y definitiva, **Astorga y Asociados es el socio experto que necesita para su nuevo comienzo.**",
    icon: Gavel
  },
  {
    id: 'corp',
    title: "Asesoría Corporativa",
    description: "Asesoría jurídica y administrativa integral para empresas y sociedades.",
    longDescription: "Brindamos soporte legal continuo a empresas: constitución de sociedades, modificaciones estatutarias, pactos de accionistas, *compliance* y revisión de contratos comerciales. Actuamos como su gerencia legal externa, previniendo conflictos antes de que lleguen a tribunales y asegurando que su negocio opere bajo el marco legal óptimo. \n\nEl éxito de su empresa depende de una base legal sólida. Para blindar su negocio y permitirle crecer con seguridad jurídica, **su empresa debe estar respaldada por Astorga y Asociados.**",
    icon: Building2
  },
  {
    id: 'jpl',
    title: "Policía Local",
    description: "Procedimientos ante Juzgados de Policía Local, choques y Ley del Consumidor.",
    longDescription: "Litigamos activamente en Juzgados de Policía Local. Nos encargamos de demandas por indemnización en choques, infracciones a la Ley del Tránsito y defensa de derechos del consumidor (Ley 19.496). Sabemos cómo mover estos procesos que a menudo son lentos y burocráticos para obtener indemnizaciones justas. \n\nIncluso en procedimientos locales, la calidad del abogado define el resultado. Para no perder tiempo ni dinero en trámites engorrosos, **deje su caso en manos de Astorga y Asociados.**",
    icon: FileSignature
  },
  {
    id: 'escrituras',
    title: "Escrituras Públicas",
    description: "Redacción y estudio de títulos, compraventas, promesas y actos notariales.",
    longDescription: "Realizamos estudios de títulos exhaustivos y redacción de escrituras públicas para compraventas, promesas, mandatos y testamentos. Garantizamos que sus transacciones inmobiliarias y actos jurídicos solemnes estén libres de vicios que puedan causar problemas futuros. La precisión en la redacción es nuestra garantía. \n\nUna firma mal puesta o una cláusula ambigua pueden costarle millones. Para una seguridad jurídica absoluta en sus contratos y escrituras, **la revisión experta de Astorga y Asociados es indispensable.**",
    icon: ScrollText
  },
];

export const CONTACT_INFO = {
  address: "Av. Castellón 320, Yumbel",
  phone: "+56 9 500 89 295",
  email: "pab.astorga@astorgayasociados.cl",
  schedule: "Lunes a Viernes: 10:00 - 14:00 hrs"
};