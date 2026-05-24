export interface ClientSnapshot {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
}

export interface CreateClientProps {
  id: string;
  name: string;
  email: string;
}

export class Client {
  private constructor(private readonly props: ClientSnapshot) {}

  static create(props: CreateClientProps): Client {
    return new Client({
      id: props.id,
      name: props.name,
      email: props.email.toLowerCase(),
    });
  }

  static restore(snapshot: ClientSnapshot): Client {
    return new Client({ ...snapshot });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  toSnapshot(): ClientSnapshot {
    return { ...this.props };
  }

  toJSON(): ClientSnapshot {
    return this.toSnapshot();
  }
}
